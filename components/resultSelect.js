import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TouchableWithoutFeedback, Dimensions  } from 'react-native';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { Table, TableWrapper, Row, Rows, Col } from 'react-native-table-component';
import DropDownPicker from 'react-native-dropdown-picker';
import {Database} from "../Database"

const db = new Database("result.db");

//component to generate cards based on test ids array
const ResultCards = (props) => {
const navigation = useNavigation()
async function showFullResult(){
  let res = await db.execute('select device, testProduct,pid from summary where id = ?',[props.id])
  console.log(res.rows)
  let prod = res.rows[0].testProduct
  let dev = res.rows[0].device
  let pid = res.rows[0].pid
  if(props.valueTest=='tapping'){
    navigation.navigate('resultPage', {tid: props.id, device: dev, product: prod, pid: pid});
  }else if(props.valueTest=='swiping'){
    navigation.navigate('swipeResultPage', {tid: props.id, device: dev, product: prod, pid: pid});
  }else if(props.valueTest=='scrolling'){
    console.log(props.id)
    navigation.navigate('scrollResultPage', {tid: props.id, device: dev, product: prod, pid: pid});
  }else{
    navigation.navigate('typeResultPage', {tid: props.id, device: dev, product: prod, pid: pid});
  }
  
}
return <View style={{padding: 10, borderWidth: 1, marginTop: 15, borderRadius: 10, width: "100%", alignItems: 'center'}}>
  <Text>Test Id: {props.id}</Text>
  <TouchableOpacity onPress = {showFullResult} style = {{...styles.roundButton}}>
    <Text>View full results</Text>
  </TouchableOpacity>
</View>
}

export const resultSelect = (props) => {
    const [btnStatus, setBtnStatus] = useState(true)
    const [countLoop, setCountLoop] = useState([])
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(null);
    const [items, setItems] = useState([
      {label: 'Apple', value: 'apple'},
      {label: 'Banana', value: 'banana'}
    ]);
    const [openTest, setOpenTest] = useState(false);
    const [valueTest, setValueTest] = useState('tapping');
    const [itemsTest, setTestItems] = useState([
      {label: 'Swiping', value: 'swiping'},
      {label: 'Tapping', value: 'tapping'},
      {label: 'Scrolling', value: 'scrolling'},
      {label: 'Typing', value: 'typing'}
    ]);

    let data = []

    //populate products dropdown based on test selected
    useEffect(()=>{
        async function getData(){
            let productData = await db.execute('select distinct testProduct from summary where testStatus = ? and testType = ?',[true, valueTest])
            productData.rows.forEach((element,index) => {
                data.push({label: element.testProduct, value: element.testProduct})
            });
        }
        getData()
        setItems(data)
    },[valueTest])

    //generate result ids array based on test and product selected
    async function showResults(){
      let table = (valueTest=='tapping')?'tapResult':(valueTest=='swiping')?'swipeResult':(valueTest=='scrolling')?'scrollResult':'typeResult'
      let idArr = await db.execute('select id from summary where testProduct = ? and testStatus = true and testType = ? order by id desc limit 3',[value,valueTest])
      let idExtract = idArr.rows.map(a => a.id)
      let resultDataOverall = await db.execute('select tid as tid from ' + table + ' group by tid order by id desc')
      let filteredOverall = resultDataOverall.rows.filter(row => idExtract.includes(row.tid))
      setCountLoop(filteredOverall)
    }
    
  
    return (
      <View style = {{flex:1, padding: 15, marginHorizontal: 15, alignItems: 'center', zIndex: 10, position: 'relative'}}>
        <Text style = {{marginBottom: 15}}>Select Test:</Text>
        <DropDownPicker
          open={openTest}
          value={valueTest}
          items={itemsTest}
          zIndex={20}
          setOpen={setOpenTest}
          setValue={setValueTest}
          setItems={setTestItems}
        />
        <Text style = {{marginVertical: 15}}>Select Product:</Text>
        <DropDownPicker
          open={open}
          value={value}
          items={items}
          zIndex={10}
          setOpen={setOpen}
          setValue={setValue}
          setItems={setItems}
          onChangeValue={()=>{setBtnStatus(false)}}
        />
        <TouchableOpacity disabled = {btnStatus} onPress = {showResults} style = {{...styles.roundButton}}>
          <Text>View Results</Text>
        </TouchableOpacity>
        
        {countLoop?.map((datum, index) => (
              <ResultCards key = {index} id = {countLoop[index].tid} valueTest = {valueTest}/>
            ))}
      </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingTop: 15, backgroundColor: '#fff' },
    roundButton: {
      marginTop: 15,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 10,
      width: "50%",
      height: 40,
      backgroundColor: '#d3d3d3',
  },
})