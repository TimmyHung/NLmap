import React,{ useRef } from 'react';
import { postRequest } from '@/components/lib/API';
import { useGoogleLogin } from '@react-oauth/google';
import AppleSignin from 'react-apple-signin-auth';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import css from '@/css/Login.module.css';
import GoogleLogo from '@/assets/google_icon.svg';

interface successProps {
    onSuccess: (response: any) => void;
}

const GoogleLoginBtn: React.FC<successProps> = ({ onSuccess }) => {
    const handleGoogle = useGoogleLogin({
        onSuccess: async (res) => {
            const requestData = {
                type: "Google",
                access_token: res.access_token,
            };
            const response = await postRequest('api/authorization/login', requestData);
            onSuccess(response);
        },
        onError: () => {
            // console.log('Login Failed')
        }, // cancel login
    });

    return (
        <>
            <button
                className={css.googleLogin}
                onClick={() => {
                    handleGoogle();
                }}
            >
                <img src={GoogleLogo} alt="Google Logo" className={css.googleLogo} />
            </button>
        </>
    );
};

// export const FacebookLoginBtn: React.FC<successProps> = ({onSuccess}) => {
//     function handleFacebookLogin(){
//         FacebookLoginClient.login((res)=>{
//             switch(res.status){
//                 case "unknown"://Login cancelled.
//                     break;
//                 case "connected"://Login successfully.
//                     FacebookLoginClient.getProfile(async (profileRes)=>{
//                         const requestData = {
//                             type: "Facebook",
//                             fbRes: profileRes,
//                         };
//                         const response = await postRequest('api/login', requestData);
//                         onSuccess(response)

//                     },{fields: 'email,name,picture'});
//                     break;   
//             }
//         }, {scope: 'public_profile, email'});


//     }

//     return(
//         <FacebookLogin
//             appId="456153207027324"
//             scope="public_profile,email"
//             fields="name,email,picture"
//             render={() => (
//                 <button className={css.facebookLogin} onClick={()=>handleFacebookLogin()} ><i className="fa-brands fa-facebook-f fa-lg"></i></button>
//             )}
//         />
//     )
// }

export const AppleLoginBtn: React.FC<successProps> = ({ onSuccess }) => {
    return (
        <AppleSignin
            authOptions={{
                clientId: 'tw.edu.tku.im.nlmap.auth',
                scope: 'email name',
                redirectURI: 'https://timmyhung.pettw.online',
                state: 'state',
                nonce: 'nonce',
                usePopup: true,
            }}
            uiType="dark"
            buttonExtraChildren={null}
            onSuccess={async (appleRes) => {
                const requestData = {
                    type: "Apple",
                    appleRes: appleRes
                };
                const response = await postRequest('api/authorization/login', requestData);
                onSuccess(response)
            }}
            onError={(error) => console.error(error)}
            render={(props) => <button {...props} className={css.appleLogin}><i className="fa-brands fa-apple fa-lg"></i></button>}
        />
    )
}

export const DiscordLoginBtn: React.FC<successProps> = ({ onSuccess }) => {
    const location = useLocation();
    const hasTriggeredRef = useRef(false);

    useEffect(() => {
        if (!hasTriggeredRef.current) {
            const params = new URLSearchParams(location.search);
            const token = params.get('token');
            const message = params.get('message');
            const status = params.get('status');
            const account_type = params.get('account_type');

            const response = {
                status: JSON.parse(status),
                message: message,
                JWTtoken: token,
                account_type: account_type
            };
            onSuccess(response);
            hasTriggeredRef.current = true;
        }
    }, [location, onSuccess]);

    const handleLogin = () => {
        window.location.href = "https://discord.com/oauth2/authorize?client_id=1248966248859963505&response_type=code&redirect_uri=https%3A%2F%2Ftimmyhungback.pettw.online%2Fapi%2Fauthorization%2Fdiscord%2Fcallback&scope=identify+email";
    };

    return (
        <button className={css.discordLogin} onClick={handleLogin}>
            <i className="fa-brands fa-discord"></i>
        </button>
    );
}

export default GoogleLoginBtn;
