import { Box, Button, Center } from '@chakra-ui/react';

// GoogleLoginButton 컴포넌트의 속성을 정의하는 인터페이스
interface Props {
  onClick: () => void; // 버튼 클릭 시 호출되는 함수
}

// Google 로그인을 위한 버튼 컴포넌트
export const GoogleLoginButton = function ({ onClick }: Props) {
  return (
    <Box>
      {/* 중앙 정렬 영역 */}
      <Center>
        {/* Google 로그인 버튼 */}
        <Button
          size="lg"
          width="full"
          mx="6"
          maxW="md"
          borderRadius="full"
          bgColor="#4285f4"
          color="white"
          colorScheme="blue"
          leftIcon={
            // Google 로고 이미지
            <img
              src="/google.svg"
              alt="구글 로고"
              style={{ backgroundColor: 'white', padding: '5px', borderRadius: '50%' }}
            />
          }
          onClick={onClick} // 클릭 이벤트 핸들러
        >
          Google 계정으로 시작하기
        </Button>
      </Center>
    </Box>
  );
};
