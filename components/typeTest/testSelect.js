import React, { useState } from 'react';
import {SafeAreaView, StyleSheet, TextInput, View, Text } from "react-native";
import DropDownPicker from 'react-native-dropdown-picker';

export const TestTypeDrop = ({onUpdate }) => {
    const [testTypeOpen, setTestTypeOpen] = useState(false);
    const [testTypeValue, setTestTypeValue] = useState('insert');
    const [testTypes, setTestTypes] = useState([
      {label: 'Insert', value: 'insert'},
      {label: 'Skip - Allow Delete', value: 'skip'},
      {label: 'Skip - No Delete', value: 'noDelete'},
    ]);

    const handleOnClick = () => {
        onUpdate(testTypeValue)
      }

    return (
        <DropDownPicker
        zIndex={3000}
        zIndexInverse={1000}
        open={testTypeOpen}
        value={testTypeValue}
        onChangeValue={handleOnClick}
        items={testTypes}
        setOpen={setTestTypeOpen}
        setValue={setTestTypeValue}
        setItems={setTestTypes}
        labelStyle = {{textAlign: 'left', fontSize:18}}
        textStyle = {{textAlign: 'left', fontSize:18}}
      />
    )
}