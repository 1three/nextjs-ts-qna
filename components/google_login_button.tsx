import { Box, Button, Center } from '@chakra-ui/react';

export const GoogleLoginButton = function () {
  return (
    <Box>
      <Center>
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
            <img
              src="/google.svg"
              alt="구글 로고"
              style={{ backgroundColor: 'white', padding: '5px', borderRadius: '50%' }}
            />
          }
        >
          Google 계정으로 시작하기
        </Button>
      </Center>
    </Box>
  );
};
