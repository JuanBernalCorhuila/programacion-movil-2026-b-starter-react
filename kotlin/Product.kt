// Ejercicio Kotlin · Parte 4 del TODO.md
//
// Alcance: solo lo visto en la semana 7 (val/var, funciones, clases, tipos que admiten null,
// `?.`, `?:`, if/when, plantillas de cadena). No exige proyecto Android.
// Cómo ejecutarlo: pegue el archivo en https://play.kotlinlang.org o compílelo con `kotlinc`.
//
// The design is in docs/api/product-entity.md ("Kotlin model").

// Limit of "few units": a stock lower than this value (and greater than 0). Same value as the app.
val LOW_STOCK_THRESHOLD = 5

// `val` for what does not change (id, name, category) and `var` for what can change (price and
// stock). The stock is `Int?`: it admits null when there is no data.
class Product(
    val id: Int,
    val name: String,
    var price: Double,
    val category: String,
    var stock: Int?,
)

// The same labels of the app, plus "Sin dato" when the stock is null.
fun stockLabel(stock: Int?): String {
    if (stock == null) return "Sin dato"
    return when {
        stock == 0 -> "Agotado"
        stock < LOW_STOCK_THRESHOLD -> "Pocas unidades"
        else -> "Disponible"
    }
}

// Returns the price minus the discount. For example, 10000.0 with 15 % gives 8500.0.
fun applyDiscount(price: Double, percent: Int): Double {
    return price - price * percent / 100
}

// Prints one product with its stock label and its price with a 10 % discount.
fun printProduct(product: Product) {
    val discountedPrice = applyDiscount(product.price, 10)
    println("${product.name} | ${product.category} | ${stockLabel(product.stock)} | Precio con 10 % de descuento: $discountedPrice")
}

fun main() {
    val water = Product(1, "Agua mineral 600 ml", 1800.0, "Bebidas", 120)
    val cookies = Product(5, "Galletas de avena x6", 2700.0, "Snacks", 0)
    val juice = Product(9, "Jugo de mango 1 L", 4500.0, "Bebidas", null)

    printProduct(water)
    printProduct(cookies)
    printProduct(juice)
}
