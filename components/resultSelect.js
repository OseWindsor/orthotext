import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView  } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import DropDownPicker from 'react-native-dropdown-picker';
import {Database} from "../Database"

const db = new Database("result.db");

//component to generate cards based on test ids array
const ResultCards = (props) => {
const navigation = useNavigation()
const [fName,setFName] = useState("Joe")

useEffect(()=>{
  async function getData(){
    let res = await db.execute('select firstName from participants where id = ?',[props.partID])
    setFName(res.rows[0].firstName)
  }
  getData()
},[])

async function showFullResult(){
  let res = await db.execute('select device, testProduct,pid,testHand from summary where id = ?',[props.id])
  console.log(res.rows)
  let prod = res.rows[0].testProduct
  let dev = res.rows[0].device
  let pid = res.rows[0].pid
  let testHand = res.rows[0].testHand
  if(props.valueTest=='tapping'){
    navigation.navigate('resultPage', {tid: props.id, device: dev, product: prod, pid: pid,testhand:testHand});
  }else if(props.valueTest=='swiping'){
    navigation.navigate('swipeResultPage', {tid: props.id, device: dev, product: prod, pid: pid});
  }else if(props.valueTest=='scrolling'){
    console.log(props.id)
    navigation.navigate('scrollResultPage', {tid: props.id, device: dev, product: prod, pid: pid});
  }else{
    navigation.navigate('typeResultPage', {tid: props.id, device: dev, product: prod, pid: pid});
  }
  
}
return <View style={{padding: 10, borderWidth: 0, margin: 5, borderRadius: 10, width: "90%", alignItems: 'left', justifyContent:"center",backgroundColor:"white",    shadowColor: '#000',
shadowOpacity: 0.2,
shadowOffset: { width: 0, height: 1 },
shadowRadius: 4,}}>
  <Text>
    <Text style={{fontWeight:"bold"}}>Test Id: </Text>
    <Text>{props.id}</Text>
  </Text>
  <Text>
    <Text style={{fontWeight:"bold"}}>Participant: </Text>
    <Text>{fName}</Text>
  </Text>
  <Text>
    <Text style={{fontWeight:"bold"}}>Posture: </Text>
    <Text>{props.posture}</Text>
  </Text>
  <Text>
    <Text style={{fontWeight:"bold"}}>Test Hand: </Text>
    <Text>{props.TH}</Text>
  </Text>
  <TouchableOpacity onPress = {showFullResult} style = {{...styles.roundIDButton, alignSelf:"flex-end",position:"absolute"}}>
    <Text>Open</Text>
  </TouchableOpacity>
</View>
}

export const resultSelect = (props) => {
    const navigation = useNavigation()
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
      {label: 'Tapping', value: 'tapping'},
      {label: 'Swiping', value: 'swiping'},
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
      let idArr = await db.execute('select id, pid, posture, testHand from summary where testProduct = ? and testStatus = true and testType = ? order by id desc',[value,valueTest])
      let idExtract = idArr.rows.map(a => a.id)
      let resultDataOverall = await db.execute('select tid as tid from ' + table + ' group by tid order by id desc')
      let filteredOverall = resultDataOverall.rows.filter(row => idExtract.includes(row.tid))
      setCountLoop(idArr.rows)
    }
    
  
    return (
      <View style={{flex:1, alignItems:"flex-start"}}>
      <View style = {{flexGrow:1, padding: 10, alignItems: 'center', zIndex: 10, position: 'relative', paddingHorizontal:20}}>
        <Text style = {{marginBottom: 10, alignSelf:"flex-start", fontSize:25, fontWeight:"bold", marginTop:15, color:"#064663"}}>View Results</Text>
        <Text style = {{marginBottom: 10, alignSelf:"flex-start", fontSize:16}}>Select Test:</Text>
        <DropDownPicker
          open={openTest}
          value={valueTest}
          items={itemsTest}
          zIndex={20}
          setOpen={setOpenTest}
          setValue={setValueTest}
          setItems={setTestItems}
          style={{borderWidth:0,    shadowColor: '#000',
          shadowOpacity: 0.4,
          shadowOffset: { width: 0, height: 1 },
          shadowRadius: 3,}}
        />
        <Text style = {{marginVertical: 10, alignSelf:"flex-start", fontSize:16}}>Select Product:</Text>
        <DropDownPicker
          open={open}
          value={value}
          items={items}
          zIndex={10}
          setOpen={setOpen}
          setValue={setValue}
          style={{borderWidth:0,    shadowColor: '#000',
          shadowOpacity: 0.4,
          shadowOffset: { width: 0, height: 1 },
          shadowRadius: 3,}}
          setItems={setItems}
          onChangeValue={()=>{setBtnStatus(false)}}
        />
        <View style={{minWidth:"100%", flexDirection:"row", flexShrink:1, justifyContent:"space-evenly"}}>
        <TouchableOpacity disabled = {btnStatus} onPress = {showResults} style = {{...styles.roundButton}}>
          <Text>Get IDs</Text>
        </TouchableOpacity>
        <TouchableOpacity disabled = {btnStatus} onPress = {()=>navigation.goBack()} style = {{...styles.roundButton}}>
          <Text>Back</Text>
        </TouchableOpacity>
        </View>
      </View>
      {countLoop.length>0 && (
        <Text style = {{marginBottom: 5, marginLeft:20,alignSelf:"flex-start", fontSize:25, fontWeight:"bold",color:"#064663"}}>Results List</Text>
        )
      }
      <ScrollView contentContainerStyle={{flexGrow:1, borderWidth:0, alignItems:"center", minWidth:"100%"}}>
        {countLoop?.map((datum, index) => (
          <ResultCards key = {index} id = {countLoop[index].id} partID = {countLoop[index].pid} posture={countLoop[index].posture} TH={countLoop[index].testHand} valueTest = {valueTest}/>
        ))}
      </ScrollView>

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
      width:150,
      height: 50,
      backgroundColor: '#d3d3d3',
      shadowColor: '#000',
      shadowOpacity: 0.4,
      shadowOffset: { width: 0, height: 1 },
      shadowRadius: 3,
  },
  roundIDButton: {
    right:"5%",
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    width:70,
    height: "100%",
    backgroundColor: '#d3d3d3',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
},
})