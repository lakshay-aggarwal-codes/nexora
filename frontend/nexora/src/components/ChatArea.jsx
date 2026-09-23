import { useEffect } from "react";
import ChatInput from "./ChatInput"; 
import MessageList from "./MessageList";
import Nav from "./Nav";
import { useDispatch, useSelector } from "react-redux";
import getMessages from "../features/getmessages";
import { setMessages } from "../redux/messageSlice";

function ChatArea() {
  
    const { selectedConversation } = useSelector((state) => state.conversations);
    const dispatch = useDispatch()
  useEffect(()=>{
    const getMesg =async()=>{
      if(selectedConversation){
       const {data}= await getMessages(selectedConversation?._id)
       dispatch(setMessages(data))
      }
      
    }
    getMesg()
  },[selectedConversation])
  return (
    <div className="h-full min-w-0 bg-[#090a0d] overflow-hidden">
      <Nav/> 
      <MessageList/>
      <ChatInput/>
    </div>
  );
}

export default ChatArea;