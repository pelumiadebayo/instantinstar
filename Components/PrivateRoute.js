import { redirect } from 'next/navigation'
import { accountService } from '_services';

function PrivateRoute({ Component, pageProps }) {
    const account = accountService.accountValue;
    if (!account) {
      redirect('/login')
    }
   
    return <Component {...pageProps} />
}

export { PrivateRoute };