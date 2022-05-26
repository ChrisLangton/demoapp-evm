import { SessionProvider } from "next-auth/react"
import "../styles/globals.css"
import { WagmiConfig, createClient } from "wagmi"

const client = createClient();

export default function App({ Component, pageProps }) {

  return (
    <WagmiConfig client={client}>
      <SessionProvider session={pageProps.session} refetchInterval={0} children={undefined}>
        <Component {...pageProps} />
      </SessionProvider>
    </WagmiConfig>
  )
}