import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import { users, parties, greyYarnPo, dyedYarnPo, fabricPo, dyedFabricPo, greyYarnPoDelivery, gYarnPoInvoice, dYarnPoInvoice, dyedYarnPoDelivery, taxDetails, greyFabricPo, accessoryPo, greyFabricPoDel, dyedFabricPoDelivery,accessoryPoDel } from "./src/routes/index.js"

const app = express()
app.use(express.json())

app.use(cors())

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const path = __dirname + '/src/views/';

app.use(express.static(path));

// app.get('/', function (req, res) {
//   res.sendFile(path + "index.html");
// });

BigInt.prototype['toJSON'] = function () {
  return parseInt(this.toString());
};

app.use("/users", users)

app.use("/parties", parties)

app.use("/greyYarnPo", greyYarnPo)

app.use("/dyedYarnPo", dyedYarnPo)

app.use("/fabricPo", fabricPo)

app.use("/dyedFabricPo", dyedFabricPo)

app.use("/greyYarnPoDelivery", greyYarnPoDelivery)

app.use("/dyedFabricPoDelivery", dyedFabricPoDelivery)

app.use("/gYarnPoInvoice", gYarnPoInvoice)

app.use("/dYarnPoInvoice", dYarnPoInvoice)

app.use("/taxDetails", taxDetails)

app.use('/greyFabricPo', greyFabricPo)

app.use("/greyFabricPoDelivery", greyFabricPoDel)

app.use("/dyedYarnPoDelivery", dyedYarnPoDelivery)

app.use("/accessoryPoDel",accessoryPoDel)

app.use("/accessoryPo", accessoryPo)


const PORT = 8000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
