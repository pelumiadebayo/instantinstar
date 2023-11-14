import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
import { accountService } from '@/Service'
import React, { useState, useEffect, useRef } from "react";
import Button from "@mui/material/Button";
import Card from '@mui/material/Card';
import IconButton from "@mui/material/IconButton";
import FacebookIcon from '@mui/icons-material/Facebook';
import Router from "next/router";

const inter = Inter({ subsets: ['latin'] })

export default function Home() { 
    
  // enable interceptors for http requests

  useEffect(() => {

    // redirect to schedule if already logged in
    if (accountService.accountValue) {
      Router.push("/scheduler")
    }
           
  }, []);

  return (
    <>
      <Head>
        <title>Instant Instar</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={`${styles.main} ${inter.className}`}>
        <div className={styles.description}>
          <p>
            Get started by&nbsp;
            <code className={styles.code}>Logging In</code>
          </p>
          <div>
            <a
              href="https://pelumiadebayo.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              By{''}
              &nbsp;
            <code className={styles.code}>Pelumi</code>            </a>
          </div>
        </div>

        <div className={styles.center}>
          <Card>
              <IconButton onClick={accountService.login}>
              <FacebookIcon color="primary" />
                  Login with Facebook
              </IconButton>
          </Card>
        </div>

        <div className={styles.grid}>
          <a
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
            className={styles.card}
            target="_blank"
            rel="noopener noreferrer"
          >
            <h2>
              Docs <span>-&gt;</span>
            </h2>
            <p>
              Find in-depth information about Next.js features and&nbsp;API.
            </p>
          </a>

          <a
            href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
            className={styles.card}
            target="_blank"
            rel="noopener noreferrer"
          >
            <h2>
              Learn <span>-&gt;</span>
            </h2>
            <p>
              Learn about Next.js in an interactive course with&nbsp;quizzes!
            </p>
          </a>

          <a
            href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
            className={styles.card}
            target="_blank"
            rel="noopener noreferrer"
          >
            <h2>
              Templates <span>-&gt;</span>
            </h2>
            <p>
              Discover and deploy boilerplate example Next.js&nbsp;projects.
            </p>
          </a>

          <a
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
            className={styles.card}
            target="_blank"
            rel="noopener noreferrer"
          >
            <h2>
              Deploy <span>-&gt;</span>
            </h2>
            <p>
              Instantly deploy your Next.js site to a shareable URL
              with&nbsp;Vercel.
            </p>
          </a>
        </div>
      </main>
    </>
  )
}
