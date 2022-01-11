import React, { useState, forwardRef,useImperativeHandle } from 'react';
import DropDownPicker from 'react-native-dropdown-picker';
import {StyleSheet} from "react-native";

export const HSDrop = forwardRef((props,ref) => {
    const [hsOpen, setHSOpen] = useState(false);
    const [hsValue, setHSValue] = useState('Medium');
    const [hsTypes, setHSTypes] = useState([
      {label: 'Small', value: 'Small'},
      {label: 'Medium', value: 'Medium'},
      {label: 'Large', value: 'Large'},
    ]);

    useImperativeHandle(ref, () => ({
        getFocus() {
          setHSOpen(true)
        }
      }));
    

    const handleOnClick = () => {
        props.onUpdate(hsValue)
      }

    return (
        <DropDownPicker
        zIndex={3000}
        zIndexInverse={1000}
        open={hsOpen}
        value={hsValue}
        innerRef={ref}
        style={{...styles.dropStyle}}
        onChangeValue={handleOnClick}
        items={hsTypes}
        setOpen={setHSOpen}
        setValue={setHSValue}
        dropDownDirection={"BOTTOM"}
        setItems={setHSTypes}
        labelStyle = {{textAlign: 'left', fontSize:18}}
        textStyle = {{textAlign: 'left', fontSize:18}}
      />
    )
})

export const TPDrop = forwardRef((props,ref) => {
    const [tpOpen, setTPOpen] = useState(false);
    const [tpValue, setTPValue] = useState('Sitting');
    const [tpTypes, setTPTypes] = useState([
      {label: 'Sitting', value: 'Sitting'},
      {label: 'Standing', value: 'Standing'},
      {label: 'Walking', value: 'Walking'},
    ]);

    const handleOnClick = () => {
        props.onUpdate(tpValue)
      }

    return (
        <DropDownPicker
        zIndex={2000}
        zIndexInverse={2000}
        open={tpOpen}
        value={tpValue}
        onChangeValue={handleOnClick}
        dropDownDirection={"BOTTOM"}
        items={tpTypes}
        style={{...styles.dropStyle}}
        setOpen={setTPOpen}
        setValue={setTPValue}
        setItems={setTPTypes}
        labelStyle = {{textAlign: 'left', fontSize:18}}
        textStyle = {{textAlign: 'left', fontSize:18}}
      />
    )
})

const styles = StyleSheet.create({
  dropStyle: {borderWidth:0,    shadowColor: '#000',
  shadowOpacity: 0.4,
  shadowOffset: { width: 0, height: 1 },
  shadowRadius: 3,}
})