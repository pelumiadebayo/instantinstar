import React, { useState, useEffect } from 'react';
import { accountService } from '../Service';
import Link from 'next/link';

function Nav() {
    const [account, setAccount] = useState(null);
    useEffect(() => {
        accountService.account.subscribe(x => setAccount(x));
    }, []);

    // only show nav when logged in
    if (!account) return null;

    return (
        <nav >
            <div >
                <Link href="/">Home</Link>
                <button onClick={accountService.logout}>Logout</button>
            </div>
        </nav>
    );
}

export { Nav }; 