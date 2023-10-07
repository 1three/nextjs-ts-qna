import { NextPage } from 'next';
import { Box, Center, Flex, Heading } from '@chakra-ui/react';
import { ServiceLayout } from '@/components/service_layout';
import { GoogleLoginButton } from '@/components/google_login_button';
import { useAuth } from '@/context/auth_user.context';

const IndexPage: NextPage = function () {
  // useAuth 훅을 사용하여 로그인 상태 및 관련 함수를 가져옴
  const { signInWithGoogle, authUser } = useAuth();
  console.info(authUser);

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
        <GoogleLoginButton onClick={signInWithGoogle} />
      </Center>
    </ServiceLayout>
  );
};

export default IndexPage;
