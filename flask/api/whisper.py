from flask import Blueprint, request, jsonify
import requests
import os
import mimetypes
from werkzeug.utils import secure_filename
from pydub import AudioSegment
from io import BytesIO
from utils.util import verify_JWTtoken
from utils.MySQL import get_db_cursor
from opencc import OpenCC

whisper_blueprint = Blueprint('whisper', __name__)

OPENAI_API_KEY = os.getenv('OPENAI_API_KEY_WHISPER')
ALLOWED_EXTENSIONS = {'wav', 'mp3', 'aac', 'm4a'}
MAX_AUDIO_DURATION = 30

# Whisper過濾條件
avg_logprob_threshold = -0.5
no_speech_prob_threshold = 0.2

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@whisper_blueprint.route('/api/whisper', methods=['POST'])
def whisper_transcription():
    JWTtoken = request.headers.get('Authorization', '').split(' ')[-1]
    JWTresponse = verify_JWTtoken(JWTtoken)[0]
    
    if not JWTresponse["status"]:
        return jsonify({'statusCode': 401, 'message': '身分驗證無效，請重新登入。'}), 200

    user_id = JWTresponse["data"]["userID"]

    if 'file' not in request.files:
        return jsonify({'statusCode': 400, 'message': 'No file uploaded'}), 200

    audio_file = request.files['file']
    filename = secure_filename(audio_file.filename)
    platform = request.form.get('platform')

    # 檢查文件擴展名
    if not allowed_file(filename):
        return jsonify({'statusCode': 400, 'message': 'File type is not allowed'}), 200

    # 檢查 MIME 類型
    mime_type, _ = mimetypes.guess_type(filename)
    if not mime_type or not mime_type.startswith('audio'):
        return jsonify({'statusCode': 400, 'message': 'Uploaded file is not an audio file'}), 200

    # 檢查文件內容是否為有效音訊文件
    try:
        audio_data = BytesIO(audio_file.read())
        audio_segment = AudioSegment.from_file(audio_data)
        audio_duration = len(audio_segment) / 1000.0  # 以秒計算時長

        # 檢查音訊時長是否超過限制
        if audio_duration >= MAX_AUDIO_DURATION + 1:
            return jsonify({'statusCode': 400, 'message': f'輸入的文件超過 {MAX_AUDIO_DURATION}秒的限制'}), 200

        audio_data.seek(0)  # 重置文件指針，以便再次讀取文件

        # 如果是wav檔案，則轉換為mp3
        if filename.rsplit('.', 1)[1].lower() == 'wav':
            audio_segment = audio_segment.export(format="mp3")
            filename = filename.rsplit('.', 1)[0] + '.mp3'
            mime_type = 'audio/mpeg'
            audio_data = BytesIO(audio_segment.read())  # 轉換後的MP3內容
            audio_data.seek(0)
    except Exception as e:
        return jsonify({'statusCode': 400, 'message': '無效的音訊檔案，請重新錄製'}), 200

    # 確保在上傳到OpenAI API之前重置指針
    audio_data.seek(0)
    # try:
    response = requests.post(
        'https://api.openai.com/v1/audio/transcriptions',
        headers={
            'Authorization': f'Bearer {OPENAI_API_KEY}',
        },
        files={
            'file': (filename, audio_data, mime_type)
        },
        data={
            'model': 'whisper-1',
            'language': 'zh',
            'response_format': 'verbose_json'
        }
    )

    response.raise_for_status()

    data = response.json()
    no_speech_prob = data['segments'][0]['no_speech_prob']

    # if(no_speech_prob > no_speech_prob_threshold):
    #     # 保存轉錄結果到資料庫
    #     save_transcription_to_db(
    #         user_id=user_id,
    #         raw_audio_duration=data["duration"],
    #         audio_duration=real_round(data["duration"]),
    #         transcript=None,
    #         platform=platform,
    #     )
    #     return jsonify({'statusCode': 400, 'message': '無法識別語音輸入，請嘗試表達的更清楚一點，或大聲一些。', 'transcript': ""}), 200

    # 過濾過程
    filtered_segments = [
        segment for segment in data["segments"]
        if segment["avg_logprob"] > avg_logprob_threshold and segment["no_speech_prob"] <= no_speech_prob_threshold
    ]
    # 將過濾後的段落重新組織為完整文字
    filtered_text = " ".join(segment["text"] for segment in filtered_segments)

    transcript = None if data['text'] == "" else data['text']

    # 保存轉錄結果到資料庫
    save_transcription_to_db(
        user_id=user_id,
        raw_audio_duration=data["duration"],
        audio_duration=real_round(data["duration"]),
        transcript=transcript,
        platform=platform,
    )

    zhTW_TextResult = OpenCC('s2t').convert(data["text"])

    return jsonify({'statusCode': 200, 'message': 'Success', 'transcript': zhTW_TextResult}), 200
    # except requests.exceptions.RequestException as e:
    #     return jsonify({'statusCode': 500, 'message': str(e)}), 200

def save_transcription_to_db(user_id, raw_audio_duration, audio_duration, transcript, platform):
    try:
        cursor, connection = get_db_cursor()
        insert_sql = """
            INSERT INTO whisper_log (user_id, raw_audio_duration, audio_duration, transcript, platform) 
            VALUES (%s, %s, %s, %s, %s)
        """
        cursor.execute(insert_sql, (user_id, raw_audio_duration, audio_duration, transcript, platform))
        connection.commit()
    except Exception as e:
        if connection:
            connection.rollback()
        print(f"Failed to save whipser log: {e}")
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

#Python中round不是四捨五入有一點小不同，所以要另外處理。
def real_round(num):
    if num < 0.5:
        return 1
    return int(num + 0.5)
