import '@/styles/globals.css'
import { initFacebookSdk, jwtInterceptor, errorInterceptor } from '../Helpers';
// enable interceptors for http requests
jwtInterceptor();
errorInterceptor();

// wait for facebook sdk before startup
initFacebookSdk();

export default function App({ Component, pageProps }) {
  const getLayout = Component.getLayout || ((page)=> page)
  return (
    <>
      {getLayout(<Component {...pageProps} />)}
    </>
  );}
