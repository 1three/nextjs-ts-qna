import { Box, Button, Center } from '@chakra-ui/react';

// GitHubLoginButton 컴포넌트의 속성을 정의하는 인터페이스
interface Props {
  onClick: () => void; // 버튼 클릭 시 호출되는 함수
}

// GitHub 로그인을 위한 버튼 컴포넌트
export const GitHubLoginButton = function ({ onClick }: Props) {
  return (
    <Box>
      {/* 중앙 정렬 영역 */}
      <Center>
        {/* GitHub 로그인 버튼 */}
        <Button
          size="lg"
          width="300px"
          mx="6"
          maxW="md"
          borderRadius="10px"
          bgColor="#ffffff"
          color="black"
          colorScheme="gray"
          fontSize="sm"
          fontWeight="normal"
          leftIcon={
            // Google 로고 이미지
            <img src="/github.svg" alt="깃허브 로고" style={{ width: '20px' }} />
          }
          onClick={onClick} // 클릭 이벤트 핸들러
        >
          GitHub 계정으로 로그인
        </Button>
      </Center>
    </Box>
  );
};
