import { SignJWT } from 'jose';
import { createPrivateKey } from 'crypto';
import NextAuth from 'next-auth/next';
import NaverProvider from 'next-auth/providers/naver';
import AppleProvider from 'next-auth/providers/apple';

export default async function auth(req, res) {
  const getAppleToken = async () => {
    const key = `-----BEGIN PRIVATE KEY-----\n${process.env.APPLE_PRIVATE_KEY}\n-----END PRIVATE KEY-----\n`;

    const appleToken = await new SignJWT({})
      .setAudience('https://appleid.apple.com')
      .setIssuer(process.env.APPLE_TEAM_ID)
      .setIssuedAt(new Date().getTime() / 1000)
      .setExpirationTime(new Date().getTime() / 1000 + 3600 * 2)
      .setSubject(process.env.APPLE_ID)
      .setProtectedHeader({
        alg: 'ES256',
        kid: process.env.APPLE_KEY_ID,
      })
      .sign(createPrivateKey(key));
    return appleToken;
  };

  return await NextAuth(req, res, {
    providers: [
      NaverProvider({
        clientId: process.env.NAVER_CLIENT_ID,
        clientSecret: process.env.NAVER_CLIENT_SECRET,
      }),

      AppleProvider({
        clientId: process.env.APPLE_ID,
        clientSecret: await getAppleToken(),
      }),
    ],

    secret: process.env.NEXTAUTH_SECRET,

    callbacks: {
      async jwt(data) {
        if (data.account) {
          data.token.accessToken = data.account.access_token;
          data.token.provider = data.account.provider;
        }
        return data.token;
      },
      async session({ session, token }) {
        if (session) {
          session.accessToken = token.accessToken;
          session.provider = token.provider;
          session.user.id = token.sub;
        }
        return session;
      },
    },
  });
}
