import { Avatar, Box, Flex, IconButton, Menu, MenuButton, MenuItem, MenuList, Spacer } from '@chakra-ui/react';
import { useAuth } from '@/context/auth_user.context';

// GNB (Global Navigation Bar) 컴포넌트
const GNB: React.FC = function () {
  // useAuth 훅을 사용하여 사용자 인증 정보 가져오기
  const { loading, authUser, signOut } = useAuth();

  // screenName 찾기
  const userEmail = authUser?.email;
  const findEmail = userEmail?.lastIndexOf('@');
  const screenName = findEmail !== undefined && findEmail !== -1 ? userEmail?.substring(0, findEmail) : undefined;

  // 사용자 메뉴
  const logOutBtn = (
    <Menu>
      <MenuButton
        as={IconButton}
        icon={<Avatar size="sm" src={authUser?.photoURL ?? 'https://bit.ly/broken-link'} />}
        borderRadius="full"
      />
      <MenuList>
        <MenuItem
          fontSize="xs"
          onClick={() => {
            window.location.href = `/${screenName ?? ''}`;
          }}
        >
          내 홈으로 이동
        </MenuItem>
        {/* <MenuItem fontSize="xs">정보 수정</MenuItem> */}
        <MenuItem fontSize="xs" onClick={signOut}>
          로그아웃
        </MenuItem>
      </MenuList>
    </Menu>
  );

  // 사용자 인증 정보 초기화 여부
  const authInitialized = loading || authUser === null;

  return (
    // 네비게이션 바 컨테이너
    <Box bg="white" borderBottom={1} borderStyle="solid" borderColor="gray.100">
      {/* 네비게이션 바 내부 */}
      <Flex minH="60px" px={{ base: 5 }} py={{ base: 2 }} align="center" maxW="md" mx="auto">
        {/* 좌측 여백 */}
        <Spacer />
        {/* 로고 영역 */}
        <Box
          position="absolute"
          left="50%"
          top="30px"
          transform="translate(-50%, -50%)"
          onClick={() => {
            window.location.href = '/';
          }}
        >
          <img style={{ height: '40px', cursor: 'pointer' }} src="/logo.svg" alt="logo" />
        </Box>
        {/* 사용자 메뉴 */}
        {authInitialized ? <Spacer /> : <Box justifyContent="flex-end">{logOutBtn}</Box>}
      </Flex>
    </Box>
  );
};

export default GNB;
