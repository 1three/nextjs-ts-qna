import {
  Avatar,
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Switch,
  Text,
  Textarea,
  VStack,
  useToast,
} from '@chakra-ui/react';
import { GetServerSideProps, NextPage } from 'next';
import { useState } from 'react';
import ResizeTextArea from 'react-textarea-autosize';
import axios, { AxiosResponse } from 'axios';
import { useQuery } from 'react-query';
import { ServiceLayout } from '@/components/service_layout';
import { useAuth } from '@/context/auth_user.context';
import { InAuthUser } from '@/models/in_auth_user';
import MessageItem from '@/components/message_item';
import { InMessage } from '@/models/message/in_message';

interface Props {
  userInfo: InAuthUser | null;
  screenName: string;
}

/**
 * 비동기 함수 : 메시지 등록
 *
 * @param uid - 사용자 식별자
 * @param message - 등록할 메시지 내용
 * @param author - 메시지 작성자 정보
 * @returns 등록 결과를 담은 Promise 객체
 */
async function postMessage({
  uid,
  message,
  author,
}: {
  uid: string;
  message: string;
  author?: {
    displayName: string;
    photoURL?: string;
  };
}) {
  // 빈 메시지인 경우 에러 반환
  if (message.length <= 0) {
    return {
      result: false,
      message: '메시지를 입력해주세요.',
    };
  }

  try {
    // 서버로 메시지 등록 요청
    await fetch('/api/messages.add', {
      method: 'post',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ uid, message, author }),
    });

    // 성공 결과 반환
    return {
      result: true,
    };
  } catch (err) {
    // 실패한 경우 에러 로깅 및 실패 결과 반환
    console.error(err);
    return {
      result: false,
      message: '메시지 등록 실패',
    };
  }
}

/**
 * 사용자 홈 페이지 컴포넌트
 */
const UserHomePage: NextPage<Props> = function ({ userInfo, screenName }) {
  // 사용자 질문 저장하는 상태
  const [message, setMessage] = useState('');
  // 익명 여부를 나타내는 상태
  const [anonymous, setAnonymous] = useState(true);
  // 현재 페이지 번호를 나타내는 상태
  const [page, setPage] = useState(1);
  // 전체 페이지 수를 나타내는 상태
  const [totalPages, setTotalPages] = useState(1);
  // 메시지 목록을 저장하는 상태
  const [messageList, setMessageList] = useState<InMessage[]>([]);
  // 메시지 목록을 갱신하는 트리거 상태
  const [messageListFetchTrigger, setMessageListFetchTrigger] = useState(false);
  // Chakra UI의 Toast 컴포넌트 사용을 위한 훅
  const toast = useToast();
  // 사용자 인증 정보를 가져오는 컨텍스트 훅
  const { authUser } = useAuth();

  /**
   * 비동기 함수 : 메시지 정보 가져오기
   *
   * @param uid - 사용자 식별자
   * @param messageId - 메시지 식별자
   */
  async function fetchMessageInfo({ uid, messageId }: { uid: string; messageId: string }) {
    try {
      // 서버로부터 메시지 정보 요청
      const resp = await fetch(`/api/messages.info?uid=${uid}&messageId=${messageId}`);

      // 요청 성공 시, 메시지 목록 업데이트
      if (resp.status === 200) {
        const data = await resp.json();
        setMessageList((prev) => {
          // 이전 메시지 목록에서 현재 메시지의 인덱스 찾기
          const findIndex = prev.findIndex((fv) => fv.id === data.id);

          // 메시지가 이미 목록에 있는 경우, 해당 메시지를 업데이트
          if (findIndex >= 0) {
            const updateArr = [...prev];
            updateArr[findIndex] = data;
            return updateArr;
          }

          // 메시지가 목록에 없는 경우, 이전 목록 그대로 반환
          return prev;
        });
      }
    } catch (err) {
      console.error(err);
    }
  }

  // 메시지 목록을 갱신하는데 사용되는 쿼리의 키 값
  const messageListQueryKey = ['messageList', userInfo?.uid, page, messageListFetchTrigger];

  // react-query를 사용하여 메시지 목록을 가져오는 쿼리 훅
  useQuery(
    messageListQueryKey,
    async () =>
      axios.get<{
        totalElements: number;
        totalPages: number;
        page: number;
        size: number;
        content: InMessage[];
      }>(`/api/messages.list?uid=${userInfo?.uid}&page=${page}&size=10`),
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
      onSuccess: (data) => {
        // 페이징 정보 설정 및 첫 페이지인 경우 목록 전체 갱신, 그렇지 않으면 이전 목록에 추가
        setTotalPages(data.data.totalPages);
        if (page === 1) {
          setMessageList([...data.data.content]);
          return;
        }
        setMessageList((prev) => [...prev, ...data.data.content]);
      },
    },
  );

  // 사용자 정보 부재 시, 에러 메시지 출력
  if (userInfo === null) {
    return <p>사용자를 찾을 수 없습니다.</p>;
  }

  // 현재 사용자가 홈(메시지)의 소유자인지 여부 확인
  const isOwner = authUser !== null && authUser.uid === userInfo.uid;

  return (
    <ServiceLayout title={`${userInfo.displayName}의 홈`} minH="100vh" bg="gray.100">
      <Box maxW="md" mx="auto" pt="6" pb="4">
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

        {/* 질문 작성 영역 */}
        <Box borderWidth="1px" borderRadius="lg" overflow="hidden" mb="2" bg="white">
          <Flex align="center" padding="2">
            <Avatar
              size="xs"
              src={anonymous ? 'https://bit.ly/broken-link' : authUser?.photoURL ?? 'https://bit.ly/broken-link'}
              mr="2"
            />
            <Textarea
              bg="gray.100"
              border="none"
              placeholder="무엇이 궁금한가요?"
              resize="none"
              minH="unset"
              overflow="hidden"
              fontSize="xs"
              mr="2"
              maxRows={7}
              as={ResizeTextArea}
              value={message}
              onChange={(e) => {
                if (e.currentTarget.value) {
                  const lineCount = (e.currentTarget.value.match(/[^\n]*\n[^\n]*/gi)?.length ?? 1) + 1;
                  if (lineCount > 7) {
                    toast({
                      title: '최대 7줄까지만 입력 가능합니다.',
                      position: 'top-right',
                    });
                    return;
                  }
                }
                setMessage(e.currentTarget.value);
              }}
            />
            <Button
              disabled={message.length === 0}
              bgColor="#6BA5FF"
              color="white"
              colorScheme="blue"
              variant="solid"
              size="sm"
              p="4"
              fontSize="xs"
              onClick={async () => {
                const postData: {
                  message: string;
                  uid: string;
                  author?: {
                    displayName: string;
                    photoURL?: string;
                  };
                } = {
                  message,
                  uid: userInfo.uid,
                };

                if (anonymous === false) {
                  postData.author = {
                    photoURL: authUser?.photoURL ?? 'https://bit.ly/broken-link',
                    displayName: authUser?.displayName ?? 'Anonymous',
                  };
                }
                const messageResp = await postMessage(postData);
                if (messageResp.result === false) {
                  toast({ title: '메시지 등록을 실패하였습니다.', position: 'top-right' });
                }
                setMessage('');
                setPage(1);
                setTimeout(() => {
                  setMessageListFetchTrigger((prev) => !prev);
                }, 50);
              }}
            >
              등록
            </Button>
          </Flex>
          <FormControl display="flex" alignItems="center" mt="1" mx="2" pb="2">
            <Switch
              size="sm"
              colorScheme="blue"
              id="anonymous"
              mr="1"
              isChecked={anonymous}
              onChange={() => {
                if (authUser === null) {
                  toast({ title: '로그인이 필요합니다.', position: 'top-right' });
                  return;
                }
                setAnonymous((prev) => !prev);
              }}
            />
            <FormLabel htmlFor="anonymous" mb="0" fontSize="xx-small">
              Anonymous
            </FormLabel>
          </FormControl>
        </Box>
        <VStack spacing="12px" mt="6">
          {messageList.map((messageData) => (
            <MessageItem
              key={`message-item-${userInfo.uid}-${messageData.id}`}
              item={messageData}
              uid={userInfo.uid}
              screenName={screenName}
              displayName={userInfo.displayName ?? ''}
              photoURL={userInfo.photoURL ?? 'https://bit.ly/broken-link'}
              isOwner={isOwner}
              onSendComplete={() => fetchMessageInfo({ uid: userInfo.uid, messageId: messageData.id })}
            />
          ))}
        </VStack>
        {totalPages > page && (
          <Button
            width="full"
            mt="4"
            fontSize="sm"
            fontWeight="normal"
            onClick={() => {
              setPage((p) => p + 1);
            }}
          >
            더보기
          </Button>
        )}
      </Box>
    </ServiceLayout>
  );
};

/**
 * 서버 측에서 실행되는 초기 데이터 로딩을 위한 getServerSideProps 함수
 *
 * @param query - Next.js의 query 객체
 * @returns 초기 데이터를 포함한 Props 객체
 */
export const getServerSideProps: GetServerSideProps<Props> = async ({ query }) => {
  const { screenName } = query;
  if (screenName === undefined) {
    return {
      props: {
        userInfo: null,
        screenName: '',
      },
    };
  }

  const screenNameToStr = Array.isArray(screenName) ? screenName[0] : screenName;

  try {
    const protocol = process.env.PROTOCOL || 'http';
    const host = process.env.HOST || 'localhost';
    const port = process.env.PORT || '3000';
    const baseUrl = `${protocol}://${host}:${port}`;
    const userInfoResp: AxiosResponse<InAuthUser> = await axios(`${baseUrl}/api/user.info/${screenName}`);

    return {
      props: {
        userInfo: userInfoResp.data ?? null,
        screenName: screenNameToStr,
      },
    };
  } catch (err) {
    console.error(err);
    return {
      props: {
        userInfo: null,
        screenName: '',
      },
    };
  }
};

export default UserHomePage;
