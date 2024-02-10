/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect, useState } from 'react';
import type {PropsWithChildren} from 'react';
import SceytChatClient from 'sceyt-chat'
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';





function App(): React.JSX.Element {

  const [client, setClient] = useState<SceytChatClient>();
    const [clientState, setClientState] = useState('');
    const [chatToken, setChatToken] = useState<string|null>(null);
    const [userId,setUserId] =useState('fd97704d-ced3-4130-ad1c-d5ad468aeb5d')
    const [otherUser,setOtherUser] =useState('0981cd01-cabc-48f2-b8e4-31c390e0c8c5')



    const getToken = async () =>{
      console.log('get Token');
      const response = await fetch(`https://icf2b3q9dd.execute-api.us-east-2.amazonaws.com/api/token?user=${userId}`);
      const tokenRes = await response.json();
    
  setChatToken(tokenRes.chat_token)
    }


    const connectClient = (token: string) => {
      const sceytClient = new SceytChatClient('https://us-ohio-api.sceyt.com', 'ldpz9kvzol', userId);
console.log('connect SCEYT');
      sceytClient.setLogLevel('trace')

      // @ts-ignore
      const listener = new sceytClient.ConnectionListener();
     
      listener.onConnectionStateChanged = async (status: string) => {
        console.log("status",status)
          setClientState(status)
          if (status === 'Failed') {
              await getToken()
          } else if (status === 'Connected') {
              sceytClient.setPresence('online')
          }
      }
      listener.onTokenWillExpire = async () => {
          getToken()
      }
      listener.onTokenExpired = async () => {
          if (clientState === 'Connected') {
              getToken()
              // handlegetToken(
          } else {
              await getToken()
          }
      }
      sceytClient.addConnectionListener('listener_id', listener);


      
      setClientState('Connecting')
      sceytClient.connect(token)
          .then(() => {
              setClient(sceytClient);
          })
          .catch((e) => {
              const date = new Date()
              console.error(`${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}:${date.getMilliseconds()} : Error on connect ... `, e);
              getToken()
          });
  }
  useEffect(() => {
      
      if (!chatToken) {
         getToken()
         
      }
      
  }, [])

  useEffect(() => {
    const getAllNotification = async () => {
      if (client) {
        // @ts-ignore
        const channelListener = new client.ChannelListener();

        channelListener.onMessage = async (
          channel: any,
          messages: any
        ) => {
          console.log('message received:', JSON.stringify(messages, null, 2));

          
        };
        client.addChannelListener('CHANNEL_EVENTS', channelListener);
      } else {
        console.log('client not found');
      }
    };

    getAllNotification();
  }, [client]);

  useEffect(() => {
    if (chatToken) {
        if (clientState === 'Connected' && client) {
          console.log('update Token');
            client.updateToken(chatToken)
        } else {
            if (client) {
              console.log("connecting")
                client.connect(chatToken)
                    .then(() => {
                        setClientState('Connected')
                    })
                    .catch((e) => {
                        const date = new Date()
                        console.error(`${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}:${date.getMilliseconds()} : Error on connect after updating the token ... `, e);
                        if (e.code === 10005 && client && client && client.connectionState === 'Connected') {
                            setClientState('Connected')
                        } else {
                            getToken()
                        }
                    });
            } else if(clientState !== 'Connecting'){
              console.log('try to connect')
                connectClient(chatToken)
            }
        }
    }

}, [chatToken])
  

  return (
    <React.Fragment>
<Text>Hello World</Text>
    </React.Fragment>
  );
}



export default App;
