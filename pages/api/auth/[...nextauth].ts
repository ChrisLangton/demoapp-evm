import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { getCsrfToken } from "next-auth/react"
import { SiweMessage } from "siwe"
import { ethers } from "ethers"


const validateNFTOwnership = async (address) => {
    try {
      const { abi } = require("../../../helpers/erc721.js");
      const contractAddress = '0xd89B00736C50C867133EBc5BF731FDbA6b29b3b7'
      const provider = await new ethers.providers.JsonRpcProvider(process.env.ALCHEMY_ENDPOINT);
      const contract = await new ethers.Contract( contractAddress , abi() , provider );  
      const balance = await contract.balanceOf(address);
      if(balance.toString() !== "0") {
        return true;
      }
  
      return false;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

export default async function auth(req, res) {
  const providers = [
    CredentialsProvider({
      name: "Ethereum",
      credentials: {
        message: {
          label: "Message",
          type: "text",
          placeholder: "0x0",
        },
        signature: {
          label: "Signature",
          type: "text",
          placeholder: "0x0",
        },
      },
      async authorize(credentials) {
        try {
          const siwe = new SiweMessage(JSON.parse(credentials?.message || "{}"))
          const domain = process.env.DOMAIN
          if (siwe.domain !== domain) {
            return null
          }

          if (siwe.nonce !== (await getCsrfToken({ req }))) {
            return null
          }

          await siwe.validate(credentials?.signature || "");
          const ownsNFT = await validateNFTOwnership(siwe.address);
          if(!ownsNFT) {
            return null
          }

          return {
            id: siwe.address
          }
        } catch (e) {
          return null
        }
      },
    }),
  ]

  const isDefaultSigninPage =
    req.method === "GET" && req.query.nextauth.includes("signin")
  
  if (isDefaultSigninPage) {
    providers.pop()
  }

  return await NextAuth(req, res, {    
    providers,
    session: {
      strategy: "jwt",
    },
    jwt: {
      secret: process.env.JWT_SECRET,
    },
    secret: process.env.NEXT_AUTH_SECRET,
    callbacks: {
      async session({ session, token }) {
        session.address = token.sub
        session.user.name = token.sub
        return session
      },
    },
  })
}