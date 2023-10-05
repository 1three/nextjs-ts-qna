import { NextPage } from 'next';
import { Box, Center, Flex, Heading } from '@chakra-ui/react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { ServiceLayout } from '@/components/service_layout';
import { GoogleLoginButton } from '@/components/google_login_button';
import FirebaseClient from '@/models/firebase_client';

// Firebase의 GoogleAuthProvider 사용
const provider = new GoogleAuthProvider();

const IndexPage: NextPage = function () {
  return (
    <ServiceLayout title="Shhh">
      <Box maxW="md" mx="auto">
        <img src="/main_logo.svg" alt="메인 로고" />
        <Flex justify="center">
          <Heading>#Shhh</Heading>
        </Flex>
      </Box>

      {/* 구글 로그인 버튼 */}
      <Center mt="20">
        <GoogleLoginButton
          onClick={() => {
            // FirebaseClient를 사용하여 Firebase Auth에 구글 로그인 팝업으로 로그인 시도
            signInWithPopup(FirebaseClient.getInstance().Auth, provider)
              .then((result) => {
                console.info(result.user);
              })
              .catch((error) => {
                console.error(error);
              });
          }}
        />
      </Center>
    </ServiceLayout>
  );
};

export default IndexPage;
