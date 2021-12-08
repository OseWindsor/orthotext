import React from 'react';
// import it
import useTypingGame, { CharStateType } from 'react-typing-game-hook';
import { Alert, SafeAreaView, StyleSheet, TextInput, View, Text } from "react-native";

export const ExpType = () => {
  // Call the hook
  const {
    states: { chars, charsState },
    actions: { insertTyping, resetTyping, deleteTyping },
  } = useTypingGame('Click on me and start typing away!');

  // Capture and display!
  return (
    <TextInput
    onKeyPress={e => {
        e.preventDefault();
        const key = e.nativeEvent.key;
        if (key === 'Escape') {
          resetTyping();
          return;
        }
        if (key === 'Backspace') {
          deleteTyping(false);
          return;
        }
        if (key.length === 1) {
          insertTyping(key);
        }
      }}
      tabIndex={0}
    >
      {chars.split('').map((char, index) => {
        let state = charsState[index];
        let color =
          state === CharStateType.Incomplete
            ? 'black'
            : state === CharStateType.Correct
            ? 'green'
            : 'red';
        return (
          <Text key={char + index} style={{ color }}>
            {char}
          </Text>
        );
      })}
    </TextInput>
  );
};

            //---------------------------------
            //--------BACKUP ALGO TO EXPLORE----
            //----------------------------------
            // let i = currentIndex - 1
            // let j = currentIndex
            // wordLength = 0
            // while(chars[i] != " " && i >= 0){
            //     wordLength = wordLength + 1
            //     i--
            // }
            // console.log(wordLength)
            // console.log(nextWordLength)
            // if(wordLength == nextWordLength){
            //   console.log("here")
            //   completedIndex = currentIndex + 1
            // }
            // nextWordLength = 0
            // while(chars[j+1] != " " && j < chars.length){
            //   nextWordLength = nextWordLength + 1
            //   j++
            // }
            //------------------------------------