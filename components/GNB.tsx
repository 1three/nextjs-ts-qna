import { Box, Button, Flex, Spacer } from '@chakra-ui/react';
import { useAuth } from '@/context/auth_user.context';

const GNB = function () {
  const { loading, authUser, signOut, signInWithGoogle } = useAuth();

  const logInBtn = (
    <Button
      fontSize="sm"
      fontWeight={600}
      color="white"
      bg="pink.400"
      borderRadius={20}
      width="80px"
      _hover={{ bg: 'pink.500' }}
      onClick={signInWithGoogle}
    >
      로그인
    </Button>
  );
  const logOutBtn = (
    <Button as="a" fontSize="sm" fontWeight={400} borderRadius={20} width="80px" onClick={signOut}>
      로그아웃
    </Button>
  );

  const authInitialized = loading || authUser === null;

  return (
    <Box bg="white" borderBottom={1} borderStyle="solid" borderColor="gray.100">
      <Flex minH="60px" px={{ base: 4 }} py={{ base: 2 }} align="center" maxW="md" mx="auto">
        <Spacer />
        <Box flex="1">
          <img style={{ height: '40px' }} src="/logo.svg" alt="logo" />
        </Box>
        <Box justifyContent="flex-end">{authInitialized ? logInBtn : logOutBtn}</Box>
      </Flex>
    </Box>
  );
};

export default GNB;
