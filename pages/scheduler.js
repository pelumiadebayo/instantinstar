import React, { useEffect, useState } from "react";
import Layout from "@/Components/Layout";
import { accountService } from "@/Service";
import Router from "next/router";


const Scheduler=() =>{
  const [imageUrl, setImageUrl] = useState("");
  const [postCaption, setPostCaption] = useState("");
  const [isSharingPost, setIsSharingPost] = useState(false);
  const [account, setAccount] = useState(null);

  useEffect(() => {
    //console.log(accountService);
    accountService.account.subscribe(loggedInAccount => {
      setAccount(loggedInAccount);
      console.log(loggedInAccount)
       //TODO:Account is null on refresh
      //check if login
      // if (!loggedInAccount) {
      //   Router.push("/")
      // }
    });
 }, []);


 
  /* --------------------------------------------------------
   *             INSTAGRAM AND FACEBOOK GRAPH APIs
   * --------------------------------------------------------
   */
  const shareInstagramPost = async () => {
    setIsSharingPost(true);
    console.log(account)
    const facebookPages = await accountService.getFacebookPages(account.accessToken);
    console.log(facebookPages)
    const instagramAccountId = await accountService.getInstagramAccountId(facebookPages[0].id);
    const mediaObjectContainerId = await accountService.createMediaObjectContainer(instagramAccountId);

    await accountService.publishMediaObjectContainer(
      instagramAccountId,
      mediaObjectContainerId
    );

    setIsSharingPost(false);
    // Reset the form state
    setImageUrl("");
    setPostCaption("");
  };

  return (
      <div id="app-main">
        {account?.accessToken ? (
          <section className="app-section">
            <h3>2. Send a post to Instagram</h3>
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Enter a JPEG image url..."
            />
            <textarea
              value={postCaption}
              onChange={(e) => setPostCaption(e.target.value)}
              placeholder="Write a caption..."
              rows="10"
            />
            <button
              onClick={shareInstagramPost}
              className="btn action-btn"
              disabled={isSharingPost || !imageUrl}
            >
              {isSharingPost ? "Sharing..." : "Share"}
            </button>
          </section>
        ) : null}
      </div>
    )
}
Scheduler.getLayout  = function getLayout(page){
  return(
    <Layout>
      {page}
    </Layout>
  )
}
export default Scheduler;