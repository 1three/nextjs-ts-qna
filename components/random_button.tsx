import { RepeatIcon } from '@chakra-ui/icons';
import { Box, Button, Center } from '@chakra-ui/react';

// 랜덤으로 방문하기 위한 버튼 컴포넌트
export const RandomButton = function () {
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
          leftIcon={<RepeatIcon />}
        >
          랜덤으로 방문하기
        </Button>
      </Center>
    </Box>
  );
};
