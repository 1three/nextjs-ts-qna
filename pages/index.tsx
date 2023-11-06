import { NextPage } from 'next';
import { Box, Center, Flex, Heading, Text } from '@chakra-ui/react';
import { ServiceLayout } from '@/components/service_layout';
import { useAuth } from '@/context/auth_user.context';
import { GoogleLoginButton } from '@/components/google_login_button';
import { GitHubLoginButton } from '@/components/github_login_button';
// import { KakaoLoginButton } from '@/components/kakao_login_button';
import { MyHomeButton } from '@/components/my_home_button';
// import { RandomButton } from '@/components/random_button';

const IndexPage: NextPage = function () {
  // useAuth 훅을 사용하여 로그인 상태 및 관련 함수를 가져옴
  const { loading, authUser, signInWithGoogle, signInWithGitHub } = useAuth();
  // 사용자 인증 정보 초기화 여부
  const authInitialized = loading || authUser === null;
  // screenName 찾기
  const userEmail = authUser?.email;
  const findEmail = userEmail?.lastIndexOf('@');
  const screenName = findEmail !== undefined && findEmail !== -1 ? userEmail?.substring(0, findEmail) : undefined;

  return (
    <ServiceLayout title="Shhh" minH="100vh" bg="gray.100" pb="10">
      <Box maxW="md" mx="auto" pt="14">
        <Center>
          <img src="/main_logo.svg" alt="메인 로고" />
        </Center>
        <Flex direction="column" align="center" mt="10">
          <Heading size="3xl" as="i">
            #Shhh
          </Heading>
          <Text fontSize="md" color="gray.500" mt="7">
            궁금한 것은 무엇이든, 비밀스럽게 질문하세요
          </Text>
        </Flex>
      </Box>

      {/* 구글 로그인 버튼 */}
      <Flex direction="column" align="center" mt="12" gap="5">
        {authInitialized ? (
          <>
            <GoogleLoginButton onClick={signInWithGoogle} />
            <GitHubLoginButton onClick={signInWithGitHub} />
            {/* <KakaoLoginButton onClick={signInWithKakao} /> */}
          </>
        ) : (
          <>
            <MyHomeButton
              onClick={() => {
                window.location.href = `/${screenName ?? ''}`;
              }}
            />
            {/* <RandomButton /> */}
          </>
        )}
      </Flex>
    </ServiceLayout>
  );
};

export default IndexPage;
