import { Avatar, Box, Button, Flex, Text } from '@chakra-ui/react';
import { GetServerSideProps, NextPage } from 'next';
import { useState } from 'react';
import axios, { AxiosResponse } from 'axios';
import Link from 'next/link';
import { ChevronLeftIcon } from '@chakra-ui/icons';
import { ServiceLayout } from '@/components/service_layout';
import { useAuth } from '@/context/auth_user.context';
import { InAuthUser } from '@/models/in_auth_user';
import MessageItem from '@/components/message_item';
import { InMessage } from '@/models/message/in_message';

interface Props {
  userInfo: InAuthUser | null;
  messageData: InMessage | null;
  screenName: string;
}

const MessagePage: NextPage<Props> = function ({ userInfo, messageData: initMsgData, screenName }) {
  // 메시지를 저장하는 상태
  const [messageData, setMessageData] = useState<null | InMessage>(initMsgData);
  // 사용자 인증 정보를 가져오는 컨텍스트 훅
  const { authUser } = useAuth();

  async function fetchMessageInfo({ uid, messageId }: { uid: string; messageId: string }) {
    try {
      const resp = await fetch(`/api/messages.info?uid=${uid}&messageId=${messageId}`);

      if (resp.status === 200) {
        const data = await resp.json();
        setMessageData(data);
      }
    } catch (err) {
      console.error(err);
    }
  }

  // 사용자 정보 부재 시, 에러 메시지 출력
  if (userInfo === null) {
    return <p>사용자를 찾을 수 없습니다.</p>;
  }
  // 메시지 부재 시, 에러 메시지 출력
  if (messageData === null) {
    return <p>메시지가 존재하지 않습니다.</p>;
  }
  // 현재 사용자가 홈(메시지)의 소유자인지 여부 확인
  const isOwner = authUser !== null && authUser.uid === userInfo.uid;

  return (
    <ServiceLayout title={`${userInfo.displayName}의 상세 게시글`} minH="100vh" bg="gray.100">
      <Box maxW="md" mx="auto" pt="2" pb="2">
        {/* 뒤로가기 버튼 */}
        <Link href={`/${screenName}`}>
          <a>
            <Button mb="2" fontSize="xs" fontWeight="normal" bg="white" opacity="" leftIcon={<ChevronLeftIcon />}>
              {screenName} 홈으로
            </Button>
          </a>
        </Link>
        {/* 유저 정보 영역 */}
        <Box borderWidth="1px" borderRadius="lg" overflow="hidden" mb="2" bg="white">
          <Flex p="6">
            <Avatar size="lg" src={userInfo.photoURL ?? 'https://bit.ly/broken-link'} mr="4" />
            <Flex direction="column" justify="center" gap="1">
              <Text fontSize="md">{userInfo.displayName}</Text>
              <Text fontSize="xs">{userInfo.email}</Text>
            </Flex>
          </Flex>
        </Box>
        <MessageItem
          item={messageData}
          uid={userInfo.uid}
          displayName={userInfo.displayName ?? ''}
          screenName={screenName}
          photoURL={userInfo.photoURL ?? 'https://bit.ly/broken-link'}
          isOwner={isOwner}
          onSendComplete={() => fetchMessageInfo({ uid: userInfo.uid, messageId: messageData.id })}
        />
      </Box>
    </ServiceLayout>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async ({ query }) => {
  const { screenName, messageId } = query;
  if (screenName === undefined) {
    return {
      props: {
        userInfo: null,
        messageData: null,
        screenName: '',
      },
    };
  }
  if (messageId === undefined) {
    return {
      props: {
        userInfo: null,
        messageData: null,
        screenName: '',
      },
    };
  }

  try {
    const protocol = process.env.PROTOCOL || 'http';
    const host = process.env.HOST || 'localhost';
    const port = process.env.PORT || '3000';
    const baseUrl = `${protocol}://${host}:${port}`;
    const userInfoResp: AxiosResponse<InAuthUser> = await axios(`${baseUrl}/api/user.info/${screenName}`);
    const screenNameToStr = Array.isArray(screenName) ? screenName[0] : screenName;
    if (userInfoResp.status !== 200 || userInfoResp.data === undefined || userInfoResp.data.uid === undefined) {
      return {
        props: {
          userInfo: null,
          messageData: null,
          screenName: screenNameToStr,
        },
      };
    }
    const messageInfoResp: AxiosResponse<InMessage> = await axios(
      `${baseUrl}/api/messages.info?uid=${userInfoResp.data.uid}&messageId=${messageId}`,
    );
    return {
      props: {
        userInfo: userInfoResp.data,
        messageData: messageInfoResp.status !== 200 || messageInfoResp.data === undefined ? null : messageInfoResp.data,
        screenName: screenNameToStr,
      },
    };
  } catch (err) {
    console.error(err);
    return {
      props: {
        userInfo: null,
        messageData: null,
        screenName: '',
      },
    };
  }
};

export default MessagePage;
