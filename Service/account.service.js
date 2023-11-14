import axios from 'axios';
import { BehaviorSubject } from 'rxjs';
import Router from 'next/router'


const baseUrl = `http://localhost:3000/api/accounts`;
const accountSubject = new BehaviorSubject(null);


// array in local storage for accounts
const accountsKey = 'react-facebook-login-accounts';
let accounts;
if (typeof window !== 'undefined' && window.localStorage){accounts = JSON.parse(localStorage.getItem(accountsKey)) || [];}

export const accountService = {
    login,
    logout,
    apiAuthenticate,
    getFacebookPages,
    getInstagramAccountId,
    createMediaObjectContainer,
    publishMediaObjectContainer,
    account: accountSubject.asObservable(),
    get accountValue () { return accountSubject.value; }
};

async function login() {
    window.FB.login(
        (response) => {
             apiAuthenticate(response.authResponse.accessToken);
             if(response.status=="connected"){
                Router.push("/scheduler");
             }
        },
        {
          // Scopes that allow us to publish content to Instagram
          scope: "instagram_basic,pages_show_list",
        }
        
      );
}

async function logout() {
    // revoke app permissions to logout completely because FB.logout() doesn't remove FB cookie
    window.FB.api('/me/permissions', 'delete', null, () => window.FB.logout());
    stopAuthenticateTimer();
    accountSubject.next(null);
    Router.push('/');
}

async function apiAuthenticate(accessToken) {
  // authenticate with the api using a facebook access token,
  // on success the api returns an account object with a JWT auth token
  const response = await axios.get(`https://graph.facebook.com/v8.0/me?access_token=${accessToken}`)
  if(response)
  {
      const { data } = response;
      if (data.error) return unauthorized(data.error.message);

      let account = accounts?.find(x => x.facebookId === data.id);
      if (!account) {
          // create new account if first time logging in
          account = {
              id: accounts?.length ? Math.max(...accounts.map(x => x.id)) + 1 : 1,
              facebookId: data.id,
              name: data.name,
              extraInfo: `This is some extra info about ${data.name} that is saved in the API`
          }
          accounts?.push(account);
          if (typeof window !== 'undefined' && window.localStorage) {
              localStorage.setItem(accountsKey, JSON.stringify(accounts));
          }
      }
      let res= {
          ...account,
          token: generateJwtToken(account)
      };
      accountSubject.next(res);
      startAuthenticateTimer();  
    };      
}

function unauthorized() {
    setTimeout(() => {
        const response = { status: 401, data: { message: 'Unauthorized' } };
        reject(response);
        
        // manually trigger error interceptor
        const errorInterceptor = axios.interceptors.response.handlers[0].rejected;
        errorInterceptor({ response });
    }, 500);
}

function generateJwtToken(account) {
    // create token that expires in 15 minutes
    const tokenPayload = { 
        exp: Math.round(new Date(Date.now() + 15*60*1000).getTime() / 1000),
        id: account.id
    }
    return `fake-jwt-token.${btoa(JSON.stringify(tokenPayload))}`;
}

async function getFacebookPages (facebookUserAccessToken) {
    return new Promise((resolve) => {
      window.FB.api(
        "me/accounts",
        { access_token: facebookUserAccessToken },
        (response) => {
          resolve(response.data);
        }
      );
    });
};
  
async function getInstagramAccountId (facebookPageId) {
return new Promise((resolve) => {
    window.FB.api(
    facebookPageId,
    {
        access_token: account.accessToken,
        fields: "instagram_business_account",
    },
    (response) => {
        resolve(response.instagram_business_account.id);
    }
    );
});
};

async function createMediaObjectContainer (instagramAccountId) {
return new Promise((resolve) => {
    window.FB.api(
    `${instagramAccountId}/media`,
    "POST",
    {
        access_token: account.accessToken,
        image_url: imageUrl,
        caption: postCaption,
    },
    (response) => {
        resolve(response.id);
    }
    );
});
};

async function publishMediaObjectContainer (
instagramAccountId,
mediaObjectContainerId
) {
return new Promise((resolve) => {
    window.FB.api(
    `${instagramAccountId}/media_publish`,
    "POST",
    {
        access_token: account.accessToken,
        creation_id: mediaObjectContainerId,
    },
    (response) => {
        resolve(response.id);
    }
    );
});
};

// helper methods

let authenticateTimeout;

function startAuthenticateTimer() {
    if(accountSubject?.value){
        const appAuth = window.FB.getAuthResponse();
        // set a timeout to re-authenticate with the api one minute before the token expires
        const timeout = (appAuth.expiresIn -60) * 1000;
        authenticateTimeout = setTimeout(() => apiAuthenticate(appAuth.accessToken), timeout);
    }
}

function stopAuthenticateTimer() {
    // cancel timer for re-authenticating with the api
    clearTimeout(authenticateTimeout);
}