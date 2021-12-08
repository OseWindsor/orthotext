import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TouchableWithoutFeedback, Dimensions  } from 'react-native';
import { CommonActions, useNavigation, useRoute } from '@react-navigation/native';
import { Table, TableWrapper, Row, Rows, Col } from 'react-native-table-component';
import {Database} from "../Database"
import { TapResult } from './tapResultMap';
const { Parser } = require('json2csv');
const json2csvParser = new Parser();
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

const db = new Database("result.db");

export const resultPage = (props) => {
    const route = useRoute();
    const navigation = useNavigation();
    const [tableHead, SetTableHead] = useState(["",'Zone1', 'Zone2', 'Overall'])
    const [tableData, setTableData] = useState([
        ['1', '2', '3'],
        ['a', 'b', 'c']
      ])
    const [tableTitle, setTableTitle] = useState(['Accuracy (%)', 'Reaction Time (s)'])
    const [participant, setParticipant] = useState(null)
    let acc = []
    let rts = []

    async function downloadData() {
        let res = await db.execute("select id,xPos,yPos,rightClick,timeTaken  from tapResult where tid = ?",[props.route.params.tid])
        const csv = json2csvParser.parse(res.rows);
        //console.log(csv);
        let prodNmae = props.route.params.product.replace(/\s/g, '');
        let partName = participant.replace(/\s/g, '');
        let filename = 'tapResult_id_' + props.route.params.tid + '_' + props.route.params.device + '_' + prodNmae + '_' + partName + '.csv'; // or some other way to generate filename
        let filepath = `${FileSystem.documentDirectory}/${filename}`;
        await FileSystem.writeAsStringAsync(filepath, csv);
        await Sharing.shareAsync(filepath, { mimeType: 'text/csv' })
    }

    useEffect(() => {
        async function getData(){
            //console.log(props.route.params.tid)
            let rightCountZ1 = await db.execute("select count(rightClick) as rightCount from tapResult where tid = ? and rightClick = ?  and xPos < ? and yPos < ?", [props.route.params.tid, 1, 45, 45])
            let timeTakenZ1 = await db.execute("select avg(timeTaken) as timeTaken from tapResult where tid = ? and xPos < ? and yPos < ?", [props.route.params.tid, 45, 45])
            let rightCountZ2 = await db.execute("select count(rightClick) as rightCount from tapResult where tid = ? and rightClick = ? and (xPos > ? or yPos > ?)", [props.route.params.tid, 1, 45, 45])
            let timeTakenZ2 = await db.execute("select avg(timeTaken) as timeTaken from tapResult where tid = ? and (xPos > ? or yPos > ?)", [props.route.params.tid, 45, 45])
            let timeTakenOverall = await db.execute("select avg(timeTaken) as timeTaken from tapResult where tid = ?", [props.route.params.tid])
            let accZ1 = (((rightCountZ1.rows[0].rightCount)/30)*100).toFixed(2)
            let accZ2 = (((rightCountZ2.rows[0].rightCount)/70)*100).toFixed(2)
            let accOverall = (((rightCountZ2.rows[0].rightCount+rightCountZ1.rows[0].rightCount)/100)*100).toFixed(2)
            let rtimeZ1 = timeTakenZ1.rows[0].timeTaken.toFixed(2)
            let rtimeZ2 = timeTakenZ2.rows[0].timeTaken.toFixed(2)
            let rtimeOverall = timeTakenOverall.rows[0].timeTaken.toFixed(2)
            acc.push(accZ1,accZ2,accOverall)
            rts.push(rtimeZ1,rtimeZ2,rtimeOverall)
            let res3 = await db.execute("select firstName, lastName from participants where id = ?",[props.route.params.pid])
            console.log(props.route.params.pid)
            setParticipant(res3.rows[0].firstName + " " + res3.rows[0].lastName)
            setTableData([acc,rts])
        }
        getData()
    }, [props.route.params.tid]);

    return (
        <View style={{...styles.container}}>
            <View style={{margin: 7, alignItems: "center"}}>
                <Text style = {{fontSize: 20, fontWeight: "100"}}>Summary Table</Text>
            </View>
            <View style={{ backgroundColor: "#fff", margin: 7, elevation: 13, borderWidth: 1, borderRadius: 10}}>

                <Table borderStyle={{borderWidth: 0}} style={{paddingTop: 15, paddingLeft: 5}}>
                <Row data={tableHead} flexArr={[2, 1, 1, 1]} style={styles.head} textStyle={styles.text}/>
                <TableWrapper style={styles.wrapper}>
                    <Col data={tableTitle} style={styles.title} textStyle={styles.textTitle}/>
                    <Rows data={tableData} flexArr={[1, 1, 1]} style={styles.row} textStyle={styles.text}/>
                </TableWrapper>
                </Table>
                <View style ={{alignItems: 'center', borderWidth: 1, borderRadius:10, padding: 10, margin: 10}}>
                    <Text style = {{fontWeight:'bold'}}>Device Tested: {props.route.params.device}</Text>
                </View>
                <View style ={{alignItems: 'center', borderWidth: 1, borderRadius:10, padding: 10, margin: 10}}>
                    <Text style={{fontWeight:'bold'}}>Product Tested: {props.route.params.product}</Text>
                </View>
                <View style ={{alignItems: 'center', borderWidth: 1, borderRadius:10, padding: 10, margin: 10}}>
                    <Text style={{fontWeight:'bold'}}>Participant: {participant}</Text>
                </View>
            </View>
            <View style={{alignItems: "center", marginTop: 15}}>
                <TouchableOpacity onPress = {() => navigation.navigate('TapResult', {params: {tid: props.route.params.tid, tdata: tableData}})} style={{...styles.roundButton}}>
                    <Text>View Detailed Results</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress = {downloadData}  style={{...styles.roundButton}}>
                    <Text>Download Data</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress = {() => navigation.navigate('resultSelect')} style={{...styles.roundButton}}>
                    <Text>View Another Result</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingTop: 15, backgroundColor: '#fff' },
    head: {  height: 40},
    wrapper: { flexDirection: 'row' },
    title: { flex: 2},
    row: {  height: 60  },
    text: { textAlign: 'center', fontWeight: 'bold', fontSize: 15 },
    textTitle: {textAlign: 'left', fontWeight: 'bold', fontSize: 15, padding: 5},
    roundButton: {
        elevation: 5,
        marginTop: 15,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        width: "95%",
        height: 60,
        backgroundColor: '#d3d3d3',
    },
  });