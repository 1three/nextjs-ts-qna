import { Box, Button, Center } from '@chakra-ui/react';

// KakaoLoginButton 컴포넌트의 속성을 정의하는 인터페이스
interface Props {
  onClick: () => void; // 버튼 클릭 시 호출되는 함수
}

// Kakao 로그인을 위한 버튼 컴포넌트
export const KakaoLoginButton = function ({ onClick }: Props) {
  return (
    <Box>
      {/* 중앙 정렬 영역 */}
      <Center>
        {/* Kakao 로그인 버튼 */}
        <Button
          size="lg"
          width="300px"
          mx="6"
          maxW="md"
          borderRadius="10px"
          bgColor="#F7E600"
          color="#3A1D1D"
          colorScheme="yellow"
          fontSize="sm"
          fontWeight="normal"
          leftIcon={
            // Kakao 로고 이미지
            <img src="/kakao.svg" alt="카카오 로고" style={{ width: '20px' }} />
          }
          onClick={onClick} // 클릭 이벤트 핸들러
        >
          카카오 계정으로 로그인
        </Button>
      </Center>
    </Box>
  );
};
