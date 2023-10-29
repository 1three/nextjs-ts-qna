import { Avatar, Box, Button, Divider, Flex, Text, Textarea } from '@chakra-ui/react';
import ResizeTextArea from 'react-textarea-autosize';
import { useState } from 'react';
import { InMessage } from '@/models/message/in_message';
import convertDateToString from '@/utils/convert_date_to_string';

interface Props {
  uid: string;
  displayName: string;
  photoURL: string;
  isOwner: boolean;
  item: InMessage;
  onSendComplete: () => void;
}

const MessageItem = function ({ uid, displayName, photoURL, isOwner, item, onSendComplete }: Props) {
  const [reply, setReply] = useState('');
  const haveReply = item.reply !== undefined;

  async function postReply() {
    const resp = await fetch('/api/messages.add.reply', {
      method: 'POST',
      headers: { 'Content-type': 'application/json' },
      body: JSON.stringify({ uid, messageId: item.id, reply }),
    });
    if (resp.status < 300) {
      onSendComplete();
    }
  }
  return (
    <Box borderRadius="md" width="full" bg="white" boxShadow="md">
      <Box>
        <Flex pl="2" pt="2" alignItems="center">
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
        </Flex>
      </Box>
      <Box p="2">
        <Box borderRadius="md" borderWidth="1px" p="3">
          <Text whiteSpace="pre-line" fontSize="small">
            {item.message}
          </Text>
        </Box>
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
                colorScheme="yellow"
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
