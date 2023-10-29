/* eslint-disable react/jsx-props-no-spreading */
import Head from 'next/head';
import { Box, BoxProps } from '@chakra-ui/react';
import GNB from './GNB';

// ServiceLayout 컴포넌트의 속성을 정의하는 인터페이스
interface Props {
  title: string;
  children: React.ReactNode;
}

// 페이지의 레이아웃 정의한 컴포넌트
export const ServiceLayout: React.FC<Props & BoxProps> = function ({ title = 'Shhh', children, ...boxProps }) {
  return (
    <Box {...boxProps}>
      <Head>
        <title>{title}</title>
      </Head>
      <GNB />
      {children}
    </Box>
  );
};
