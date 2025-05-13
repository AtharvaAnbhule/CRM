import { ReactNode } from 'react';
import StreamVideoProvider from '../providers/stream-client-provider';

import "@stream-io/video-react-sdk/dist/css/styles.css";

const RootLayout = ({ children }: Readonly<{ children: ReactNode }>) => {
  return (
    <main>
      <StreamVideoProvider>{children}</StreamVideoProvider>
    </main>
  );
};

export default RootLayout;