const PROMPT="Esta imagen es una hoja de playbook de flag football 5v5 (dibujada o digital) con una o varias jugadas. Devuelve un arreglo JSON con una entrada por jugada: {n:nombre, players:[{letter:\"X\", x:3, y:0, route:[[x,y],...]}]}. Incluye una entrada de players por cada ficha dibujada en esa jugada. El campo mide 25 yardas de ancho: x va de 0 (izquierda) a 25 (derecha). y son yardas respecto a la línea de golpeo: 0 en la línea, negativo atrás, positivo hacia adelante hasta 25. letter es la letra exacta escrita en cada ficha de esa jugada (Q mariscal, C centro, X externo izquierdo, Y externo derecho, Z interno). La letra viaja con el jugador: léela de cada ficha, no la deduzcas por su posición, y respeta cuando una letra cambia de lado entre jugadas. Si una ficha no tiene letra, usa su rol. route lista los puntos donde la ruta cambia de dirección, en orden, incluyendo el final; Q no lleva ruta. Omite lo que no se vea. Responde solo JSON.";
module.exports=async(req,res)=>{
  if(req.method!=='POST')return res.status(405).end();
  try{
    const image=req.body&&req.body.image;
    if(!image||image.length>6000000)return res.status(400).json({error:'imagen'});
    const model=process.env.GEMINI_MODEL||'gemini-flash-latest';
    const r=await fetch('https://generativelanguage.googleapis.com/v1beta/models/'+model+':generateContent',{
      method:'POST',
      headers:{'content-type':'application/json','x-goog-api-key':process.env.GEMINI_API_KEY},
      body:JSON.stringify({
        contents:[{parts:[{inline_data:{mime_type:'image/jpeg',data:image}},{text:PROMPT}]}],
        generationConfig:{responseMimeType:'application/json'}
      })
    });
    const d=await r.json();
    const t=(((d.candidates||[])[0]||{}).content||{}).parts;
    const txt=t&&t[0]&&t[0].text||'';
    res.status(200).json(JSON.parse(txt.replace(/```json|```/g,'').trim()));
  }catch(e){res.status(500).json({error:'fallo'})}
};
