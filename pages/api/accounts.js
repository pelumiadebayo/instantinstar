import axios from 'axios';

import { accountService } from '../../Service';

// array in local storage for accounts
const accountsKey = 'react-facebook-login-accounts';
let accounts = (typeof window !== 'undefined' && window.localStorage)? JSON.parse(localStorage.getItem(accountsKey)) : [];

export default function handler(req, res){
    const { method, url } = req;
    switch (method) {
      case "GET":
        res.status(200).json({ name: req.url });
        break;
      case "POST":
        const data = authenticate(req.body);
        res.status(200).json(data);
        break;
      default:
        //res.setHeader("Allow", ["GET", "POST"]);
        res.status(405).end(`Method ${method} Not Allowed`);
        break;
    }


    function authenticate(m){
         const  accessToken  = m;
        axios.get(`https://graph.facebook.com/v8.0/me?access_token=${accessToken}`)
        .then(response => {
            const { data } = response;
            if (data.error) return unauthorized(data.error.message);
            console.log(accounts);
            let account = accounts?.find(x => x.facebookId === data.id);
            if (!account) {
                // create new account if first time logging in
                account = {
                    id: newAccountId(),
                    facebookId: data.id,
                    name: data.name,
                    extraInfo: `This is some extra info about ${data.name} that is saved in the API`
                }
                accounts.push(account);
                if (typeof window !== 'undefined' && window.localStorage) {
                    localStorage.setItem(accountsKey, JSON.stringify(accounts));
                }
            }

            return ok({
                ...account,
                token: generateJwtToken(account)
            });
        });
    }

    function getAccounts() {
        if (!isLoggedIn()) return unauthorized();
        return ok(accounts);
        }

    function getAccountById() {
        if (!isLoggedIn()) return unauthorized();

        let account = accounts.find(x => x.id === idFromUrl());
        return ok(account);
    }

    function updateAccount() {
        if (!isLoggedIn()) return unauthorized();

        let params = body();
        let account = accounts.find(x => x.id === idFromUrl());

        // update and save account
        Object.assign(account, params);
        if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem(accountsKey, JSON.stringify(accounts));
        }
        return ok(account);
    }

    function deleteAccount() {
        if (!isLoggedIn()) return unauthorized();

        // delete account then save
        accounts = accounts.filter(x => x.id !== idFromUrl());
        if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem(accountsKey, JSON.stringify(accounts));
        }
        return ok();
    }

    // helper functions

    function ok(body) {
    // wrap in timeout to simulate server api call
        setTimeout(() => resolve({ status: 200, data: body }), 500);
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

    function isLoggedIn() {
        return accountService.accountValue;
    }

    function idFromUrl() {
        const urlParts = url.split('/');
        return parseInt(urlParts[urlParts.length - 1]);
    }

    function body() {
        if (['post', 'put'].includes(method))
            return params[0];
    }

    function newAccountId() {
        return accounts.length ? Math.max(...accounts.map(x => x.id)) + 1 : 1;
    }

    function generateJwtToken(account) {
        // create token that expires in 15 minutes
        const tokenPayload = { 
            exp: Math.round(new Date(Date.now() + 15*60*1000).getTime() / 1000),
            id: account.id
        }
        return `fake-jwt-token.${btoa(JSON.stringify(tokenPayload))}`;
    }
    

}

// export function fakeBackend() {
//     const methods = ['get', 'post', 'put', 'delete'];
//     methods.forEach(method => {
//         axios[`original${method}`] = axios[method];
//         axios[method] = function (url, ...params) {
//             return new Promise((resolve, reject) => {
//                 return handleRoute();

//                 function handleRoute() {
//                     switch (true) {
//                         case url.endsWith('/accounts/authenticate') && method === 'post':
//                             return authenticate();
//                         case url.endsWith('/accounts') && method === 'get':
//                             return getAccounts();
//                         case url.match(/\/accounts\/\d+$/) && method === 'get':
//                             return getAccountById();
//                         case url.match(/\/accounts\/\d+$/) && method === 'put':
//                             return updateAccount();
//                         case url.match(/\/accounts\/\d+$/) && method === 'delete':
//                             return deleteAccount();
//                         default:
//                             // pass through any requests not handled above
//                             return axios[`original${method}`](url, body())
//                                 .then(response => resolve(response))
//                                 .catch(error => reject(error));
//                     }
//                 }

//                 // route functions

//                 function authenticate() {
//                     const { accessToken } = body();

//                     axios.get(`https://graph.facebook.com/v8.0/me?access_token=${accessToken}`)
//                         .then(response => {
//                             const { data } = response;
//                             if (data.error) return unauthorized(data.error.message);

//                             let account = accounts.find(x => x.facebookId === data.id);
//                             if (!account) {
//                                 // create new account if first time logging in
//                                 account = {
//                                     id: newAccountId(),
//                                     facebookId: data.id,
//                                     name: data.name,
//                                     extraInfo: `This is some extra info about ${data.name} that is saved in the API`
//                                 }
//                                 accounts.push(account);
//                                 if (typeof window !== 'undefined' && window.localStorage) {
//                                     localStorage.setItem(accountsKey, JSON.stringify(accounts));
//                                 }
//                             }

//                             return ok({
//                                 ...account,
//                                 token: generateJwtToken(account)
//                             });
//                         });
//                 }
    
//                 function getAccounts() {
//                     if (!isLoggedIn()) return unauthorized();
//                     return ok(accounts);
//                 }

//                 function getAccountById() {
//                     if (!isLoggedIn()) return unauthorized();

//                     let account = accounts.find(x => x.id === idFromUrl());
//                     return ok(account);
//                 }

//                 function updateAccount() {
//                     if (!isLoggedIn()) return unauthorized();

//                     let params = body();
//                     let account = accounts.find(x => x.id === idFromUrl());

//                     // update and save account
//                     Object.assign(account, params);
//                     if (typeof window !== 'undefined' && window.localStorage) {
//                         localStorage.setItem(accountsKey, JSON.stringify(accounts));
//                     }
//                     return ok(account);
//                 }

//                 function deleteAccount() {
//                     if (!isLoggedIn()) return unauthorized();

//                     // delete account then save
//                     accounts = accounts.filter(x => x.id !== idFromUrl());
//                     if (typeof window !== 'undefined' && window.localStorage) {
//                      localStorage.setItem(accountsKey, JSON.stringify(accounts));
//                     }
//                     return ok();
//                 }

//                 // helper functions
    
//                 function ok(body) {
//                     // wrap in timeout to simulate server api call
//                     setTimeout(() => resolve({ status: 200, data: body }), 500);
//                 }
    
//                 function unauthorized() {
//                     setTimeout(() => {
//                         const response = { status: 401, data: { message: 'Unauthorized' } };
//                         reject(response);
                        
//                         // manually trigger error interceptor
//                         const errorInterceptor = axios.interceptors.response.handlers[0].rejected;
//                         errorInterceptor({ response });
//                     }, 500);
//                 }
        
//                 function isLoggedIn() {
//                     return accountService.accountValue;
//                 }

//                 function idFromUrl() {
//                     const urlParts = url.split('/');
//                     return parseInt(urlParts[urlParts.length - 1]);
//                 }

//                 function body() {
//                     if (['post', 'put'].includes(method))
//                         return params[0];
//                 }
                
//                 function newAccountId() {
//                     return accounts.length ? Math.max(...accounts.map(x => x.id)) + 1 : 1;
//                 }
    
//                 function generateJwtToken(account) {
//                     // create token that expires in 15 minutes
//                     const tokenPayload = { 
//                         exp: Math.round(new Date(Date.now() + 15*60*1000).getTime() / 1000),
//                         id: account.id
//                     }
//                     return `fake-jwt-token.${btoa(JSON.stringify(tokenPayload))}`;
//                 }
//             });
//         }
//     });
// }