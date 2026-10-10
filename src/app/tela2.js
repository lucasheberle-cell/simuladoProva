import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { Button, FlatList, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("tela2.db");

db.execSync(`
  CREATE TABLE IF NOT EXISTS tarefas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    autor TEXT NOT NULL,
    paginas INTEGER NOT NULL
  );
`);

function listar() {
    return db.getAllSync("SELECT * FROM tarefas ORDER BY id DESC");
}

function adicionar(titulo, autor, paginas) {
    db.runSync("INSERT INTO tarefas (titulo, autor, paginas) VALUES (?, ?, ?)", [titulo, autor, paginas]);
}

function remover(id) {
    db.runSync("DELETE FROM tarefas WHERE id = ?", [id]);
}

function edita(id, titulo, autor, paginas) {
    db.runSync("UPDATE tarefas SET titulo = ?, autor = ?, paginas = ? WHERE id = ?", [titulo, autor, paginas, id]);
}

export default function ListaDb() {

    const [titulo, setTitulo] = useState("");
    const [lista, setLista] = useState([]);
    const [autor, setAutor] = useState("");
    const [paginas, setPaginas] = useState("");
    const [idEditando, setIdEditando] = useState(0);

    function carregar() {
        setLista(listar());
    }

    useEffect(() => {
        carregar();
    }, []);

    function salvar() {
        adicionar(titulo, autor, paginas);
        setTitulo("");
        setAutor("");
        setPaginas("");
        carregar();
    }

    function excluir(id) {
        remover(id);
        carregar();
    }

    function editar(lista) {
        setIdEditando(lista.id);
        setTitulo(lista.titulo);
        setAutor(lista.autor);
        setPaginas(String(lista.paginas));
    }

    function guardarEdicao() {
        if (idEditando == 0) {
            salvar(titulo, autor, paginas);
        } else {
            edita(idEditando, titulo, autor, paginas);
        }
        setTitulo("");
        setIdEditando(0);
        setAutor("");
        setPaginas("");
        carregar();
    }


    return (
        <SafeAreaView style={styles.tela} edges={["bottom"]}>
            <Stack.Screen options={{ title: "Lista" }} />
            <Text style={styles.titulo}>Biblioteca</Text>
            <TextInput
                style={styles.entrada}
                placeholder="Digite o Título..."
                value={titulo}
                onChangeText={setTitulo}
            />
            <TextInput
                style={styles.entrada}
                placeholder="Digite o Autor..."
                value={autor}
                onChangeText={setAutor}
            />
            <TextInput
                style={styles.entrada}
                placeholder="Digite o número de páginas..."
                keyboardType="numeric"
                value={paginas}
                onChangeText={(texto) => setPaginas(texto.replace(/\D/g, ""))}
            />
            {idEditando !== 0 ? (
                <Button title="Guardar Edição" onPress={guardarEdicao} />
            ) : (
                <Button title="Salvar" onPress={salvar} />
            )}
            <FlatList
                data={lista}
                renderItem={({ item }) => (
                    <View style={styles.itemContainer}>
                        <Text style={styles.item}>{item.nome} {item.cor} {item.cientifico}</Text>
                        <Button title="🗑️" color="#D64545" onPress={() => excluir(item.id)} />
                        <Button title="✏️" color="#48494b" onPress={() => editar(item)} />
                    </View>
                )}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    tela: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    titulo: {
        fontSize: 35,
        fontWeight: "bold",
        textAlign: "center",
    },
    entrada: {
        borderWidth: 1,
        borderColor: "#030303",
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
    },
    item: {
        flex: 1,
        backgroundColor: "#48494b",
        color: "#FFFFFF",
        padding: 10,
        marginTop: 5,
    },
    itemContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
});
//Olá casada >:)