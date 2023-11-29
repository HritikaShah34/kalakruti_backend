const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');


const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());



app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

mongoose
  .connect('mongodb://127.0.0.1:27017/Kalakrutee', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });


const productSchema = new mongoose.Schema({
  
  product_name: {
    type: String,
    required: true,
  },
  product_description: {
    type: String,
    required: true,
  },
  product_code: {
    type: String,
    required: true,
    unique : true
  },
  product_img: {
    type: String,
    // required: true,
  },
  product_sp: {
    type: Number, // Selling Price
    required: true,
  },
  product_cp: {
    type: Number, // Cost Price
    required: true,
  },
  product_quantity: {
    type: Number,
    required: true,
  },
});

const Product = mongoose.model('Product', productSchema);

// Set up multer for handling file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads') // Define the upload directory
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname) // Define the filename
  }
});

const upload = multer({ storage: storage });

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Assuming your images are stored in the 'uploads' directory
app.use('/uploads', express.static('uploads'));

// Create a new product
app.post('/create_product', upload.single('product_img'),async (req, res) => {
  try {
    const newProduct = new Product({
      // product_id: req.body.product_id,
      product_name: req.body.product_name,
      product_description: req.body.product_description,
      product_code: req.body.product_code,
      product_img: req.file.path, // Multer will add 'file' property to the request object
      product_sp: req.body.product_sp,
      product_cp: req.body.product_cp,
      product_quantity: req.body.product_quantity,
    });
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
    console.log(savedProduct);
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ error: error.message });
  }
});


// Get all products
app.get('/products',  async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search products by code
app.get('/products/search/:code', async (req, res) => {
  try {
    const productCode = req.params.code;
    // const regex = new RegExp(productName, 'i'); // Case-insensitive search

    const products = await Product.findOne({ product_code:productCode });

    console.log(products);
    if (products.length === 0) {
      return res.status(404).json({ error: 'No products found with the given name' });
    }

    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//search product by id

app.get('/getProduct/:productId', async (req, res) => {
  try {
    const productId = req.params.productId;
    console.log(productId);
    const product = await Product.findOne({ product_code: productId });

    console.log(product);

    if (!product) {
      return res.status(404).json({ error: 'No product found with the given product_id' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//update product
app.put('/updateProducts/:productId',upload.single('product_img'), async (req, res) => {
  console.log(req.params.productId)
  try {
    const productId = req.params.productId;

    // Check if the product exists
    const existingProduct = await Product.findOne({ product_code: productId });
    console.log(existingProduct)
    if (!existingProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Update the fields if they are provided in the request body
    if (req.body.product_name) {
      existingProduct.product_name = req.body.product_name;
    }
    if (req.body.product_description) {
      existingProduct.product_description = req.body.product_description;
    }
    if (req.body.product_code) {
      existingProduct.product_code = req.body.product_code;
    }
    if (req.file) {
      existingProduct.product_img = req.file.path;
    }
    if (req.body.product_sp) {
      existingProduct.product_sp = req.body.product_sp;
    }
    if (req.body.product_cp) {
      existingProduct.product_cp = req.body.product_cp;
    }
    if (req.body.product_quantity) {
      existingProduct.product_quantity = req.body.product_quantity;
    }

    // Save the updated product
    const updatedProduct = await existingProduct.save();
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/deleteProducts/:productId', async (req, res) => {
  try {
    // const deletedProduct = await Product.findByIdAndDelete(req.params.productId);
    const deletedProduct = await Product.findOneAndDelete({ product_code: req.params.productId });
    if (!deletedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});