import React, { useState } from 'react';
import {SafeAreaView, StyleSheet, TextInput, View, Text } from "react-native";
import DropDownPicker from 'react-native-dropdown-picker';

export const TestTypeDrop = ({onUpdate }) => {
    const [testTypeOpen, setTestTypeOpen] = useState(false);
    const [testTypeValue, setTestTypeValue] = useState('noDelete');
    const [testTypes, setTestTypes] = useState([
      {label: 'Skip - No Delete', value: 'noDelete'},
      {label: 'Insert', value: 'insert'},
      {label: 'Skip - Allow Delete', value: 'skip'}
    ]);

    const handleOnClick = () => {
        onUpdate(testTypeValue)
      }

    return (
        <DropDownPicker
        zIndex={1000}
        zIndexInverse={3000}
        open={testTypeOpen}
        value={testTypeValue}
        onChangeValue={handleOnClick}
        dropDownDirection={"BOTTOM"}
        items={testTypes}
        setOpen={setTestTypeOpen}
        setValue={setTestTypeValue}
        setItems={setTestTypes}
        style={{...styles.dropStyle}}
        labelStyle = {{textAlign: 'left', fontSize:18}}
        textStyle = {{textAlign: 'left', fontSize:18}}
      />
    )
}

const styles = StyleSheet.create({
  dropStyle: {borderWidth:0,    shadowColor: '#000',
  shadowOpacity: 0.4,
  shadowOffset: { width: 0, height: 1 },
  shadowRadius: 3,}
})