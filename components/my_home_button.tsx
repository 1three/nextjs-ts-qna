import { StarIcon } from '@chakra-ui/icons';
import { Box, Button, Center } from '@chakra-ui/react';

interface Props {
  onClick: () => void; // 버튼 클릭 시 호출되는 함수
}

// 내 홈으로 이동하기 위한 버튼 컴포넌트
export const MyHomeButton = function ({ onClick }: Props) {
  return (
    <Box>
      {/* 중앙 정렬 영역 */}
      <Center>
        <Button
          size="lg"
          width="300px"
          mx="6"
          maxW="md"
          borderRadius="10px"
          bgGradient="linear(to-r, #FE6CB8, #81B2FF)"
          color="white"
          colorScheme=""
          fontSize="sm"
          fontWeight="normal"
          leftIcon={<StarIcon />}
          onClick={onClick} // 클릭 이벤트 핸들러
        >
          내 홈으로 이동하기
        </Button>
      </Center>
    </Box>
  );
};
