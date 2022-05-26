import React, { useState, useEffect } from 'react'
import { signOut, useSession } from "next-auth/react"
import Link from 'next/link';

const Gallery = () => {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if(session) {
      //  loadFiles
      setLoading(false);
    }
  }, [session]);

  if(loading) {
    <div>
      <h1>Loading...</h1>
    </div>
  } else {
    return (
      <div>
        {
          !session ? 
          <div>
            <h1>You need to sign in</h1>
            <Link to="/">Sign in</Link>
          </div> : 
          <div>
            Gallery
          </div>
        }
      </div>
    )
  } 
}

export default Gallery