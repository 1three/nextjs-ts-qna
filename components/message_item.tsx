import {
  Avatar,
  Box,
  Button,
  Divider,
  Flex,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Spacer,
  Text,
  Textarea,
  useToast,
} from '@chakra-ui/react';
import ResizeTextArea from 'react-textarea-autosize';
import { useState } from 'react';
import { InMessage } from '@/models/message/in_message';
import convertDateToString from '@/utils/convert_date_to_string';
import MoreBtnIcon from './more_btn_icon';
import FirebaseClient from '@/models/firebase_client';

// MessageItem 컴포넌트의 속성을 정의하는 인터페이스
interface Props {
  uid: string;
  displayName: string;
  screenName: string;
  photoURL: string;
  isOwner: boolean;
  item: InMessage;
  onSendComplete: () => void;
}

// 각 메시지 아이템을 렌더링하는 컴포넌트
const MessageItem = function ({ uid, displayName, screenName, photoURL, isOwner, item, onSendComplete }: Props) {
  // toast
  const toast = useToast();
  // 댓글 작성 상태 관리하는 상태 변수
  const [reply, setReply] = useState('');

  // 댓글 등록 함수
  async function postReply() {
    const resp = await fetch('/api/messages.add.reply', {
      method: 'POST',
      headers: { 'Content-type': 'application/json' },
      body: JSON.stringify({ uid, messageId: item.id, reply }),
    });

    // 응답 성공 시, 부모 컴포넌트에 등록 완료 알림
    if (resp.status < 300) {
      onSendComplete();
    }
  }

  // 메시지 거절 함수
  async function updateMessage({ deny }: { deny: boolean }) {
    try {
      const token = await FirebaseClient.getInstance().Auth.currentUser?.getIdToken();
      if (token === undefined) {
        toast({
          title: '로그인한 사용자만 사용할 수 있는 메뉴입니다.',
        });
        return;
      }

      const resp = await fetch('/api/messages.deny', {
        method: 'PUT',
        headers: { 'Content-type': 'application/json', authorization: token },
        body: JSON.stringify({ uid, messageId: item.id, deny }),
      });

      // 응답 성공 시, 부모 컴포넌트에 등록 완료 알림
      if (resp.status < 300) {
        onSendComplete();
      }
    } catch (err) {
      console.log(err);
      toast({
        title: '로그인한 사용자만 사용할 수 있는 메뉴입니다.',
      });
    }
  }

  // 댓글 유무 확인
  const haveReply = item.reply !== undefined;
  // 메시지 거절 여부 확인
  const isDeny = item.deny !== undefined ? item.deny === true : false;

  return (
    <Box borderRadius="md" width="full" bg="white" boxShadow="md">
      {/* 메시지 작성자 정보 영역 */}
      <Box>
        <Flex px="2" pt="2" alignItems="center">
          <Avatar
            size="xs"
            src={item.author ? item.author.photoURL ?? 'https://bit.ly/broken-link' : 'https://bit.ly/broken-link'}
          />
          <Text fontSize="small" ml="1" pl="1">
            {item.author ? item.author.displayName : 'Annonymous'}
          </Text>
          <Text whiteSpace="pre-line" fontSize="xx-small" color="gray.500" ml="1">
            {convertDateToString(item.createAt)} 전
          </Text>
          <Spacer />
          {isOwner && (
            <Menu>
              <MenuButton
                as={IconButton}
                icon={<MoreBtnIcon />}
                width="24px"
                height="24px"
                borderRadius="full"
                variant="link"
                size="xs"
                alignItems="center"
              />
              <MenuList>
                <MenuItem
                  fontSize="xs"
                  onClick={() => {
                    updateMessage({ deny: item.deny !== undefined ? !item.deny : true });
                  }}
                >
                  {isDeny ? '비공개 처리 해제' : '비공개 처리'}
                </MenuItem>
                <MenuItem
                  fontSize="xs"
                  onClick={() => {
                    window.location.href = `/${screenName}/${item.id}`;
                  }}
                >
                  상세 메시지 보기
                </MenuItem>
              </MenuList>
            </Menu>
          )}
        </Flex>
      </Box>
      <Box p="2">
        {/* 메시지 내용 영역 */}
        <Box borderRadius="md" borderWidth="1px" p="3">
          <Text whiteSpace="pre-line" fontSize="small">
            {item.message}
          </Text>
        </Box>
        {/* 댓글 존재 시, 댓글 영역 */}
        {haveReply && (
          <Box pt="2">
            <Divider />
            <Box display="flex" mt="2">
              <Box pt="2">
                <Avatar size="xs" src={photoURL} mr="2" />
              </Box>
              <Box borderRadius="md" px="3.5" py="2.5" width="full" bg="gray.100">
                <Flex alignItems="center">
                  <Text fontSize="small">{displayName}</Text>
                  <Text whiteSpace="pre-line" fontSize="xx-small" color="gray" ml="1">
                    {convertDateToString(item.replyAt!)} 전
                  </Text>
                </Flex>
                <Text whiteSpace="pre-line" fontSize="xs">
                  {item.reply}
                </Text>
              </Box>
            </Box>
          </Box>
        )}
        {/* 댓글 부재 + 작성자가 관리자인 경우, 댓글 작성 영역 */}
        {haveReply === false && isOwner && (
          <Box pt="2">
            <Divider />
            <Box display="flex" mt="2">
              <Box pt="1">
                <Avatar size="xs" src={photoURL} mr="2" />
              </Box>
              <Box borderRadius="md" width="full" bg="gray.100" mr="2">
                <Textarea
                  border="none"
                  boxShadow="none !important"
                  resize="none"
                  minH="unset"
                  overflow="hidden"
                  fontSize="xs"
                  placeholder="댓글을 입력하세요"
                  as={ResizeTextArea}
                  value={reply}
                  onChange={(e) => {
                    setReply(e.currentTarget.value);
                  }}
                />
              </Box>
              <Button
                disabled={reply.length === 0}
                bgColor="#FF75B5"
                color="white"
                colorScheme="pink"
                variant="solid"
                size="sm"
                p="4"
                fontSize="xs"
                onClick={() => {
                  postReply();
                }}
              >
                등록
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default MessageItem;
