let conver = async () => {
    const api = "https://mindicador.cl/api";
    const moneda = document.querySelector("#moneda");
    const cantidad = document.querySelector("#cantidad");
    const btnConvertir = document.querySelector("#btnConvertir");
    const resultado = document.querySelector("#resultado");
    const errorAlerta = document.querySelector("#error");
    const canvaGrafico = document.getElementById("canvaGrafico")
    let grafico;

    try{
        const res = await fetch(api)
        const data = await res.json()
        const monedas = ["dolar", "euro", "uf"]
        monedas.forEach(codigo => {
            const indicador = data[codigo];
            if (indicador) {
                const opt = document.createElement('option');
                opt.value = codigo;
                opt.textContent = `${indicador.nombre} (${indicador.unidad_medida})`;
                moneda.appendChild(opt);
            }
        });
    } catch (err) {
        errorAlerta.textContent = "Error al cargar moneda: " + err;
    }

    btnConvertir.addEventListener("click", async () => {
        const monto = Number(cantidad.value);
        const tipoCambio = moneda.value;
        resultado.textContent = "";
        errorAlerta.textContent = "";

        try {
            const res = await fetch(api);
            const data = await res.json();
            const tasa = data[tipoCambio].valor;
            const convertido = monto / tasa;
            resultado.textContent = `${monto.toLocaleString()} CLP = ${convertido.toFixed(2)} ${data[tipoCambio].codigo.toUpperCase()}`;

            const hisRes = await fetch(`${api}/${tipoCambio}`);
            const histData = await hisRes.json();
            const serie10 = histData.serie.slice(0, 10).reverse();
            const labels = serie10.map(item => new Date(item.fecha).toLocaleDateString());
            const valores = serie10.map(item => item.valor);

            if (grafico){
                grafico.data.labels = labels;
                grafico.data.datasets[0].data = valores;
                grafico.update();
            } else {
                grafico = new Chart(canvaGrafico, {
                    type: "line",
                    data:{
                        labels,
                        datasets: [{
                            label: `Valor ${histData.nombre}`,
                            data: valores,
                            fill: false,
                        }]
                    },
                    options: {
                        scales:{
                            x: {display: true},
                            y: {display: true}
                        }
                    }
                });
            }

        } catch (err) {
            errorAlerta.textContent = "Ocurrio un error: " + err;
        }
    });
}

conver()