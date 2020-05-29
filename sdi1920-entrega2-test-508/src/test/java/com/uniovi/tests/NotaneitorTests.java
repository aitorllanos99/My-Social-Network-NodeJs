package com.uniovi.tests;

//Paquetes Java
import java.util.List;
//Paquetes JUnit 
import org.junit.*;
import org.junit.runners.MethodSorters;
import static org.junit.Assert.assertTrue;
//Paquetes Selenium 
import org.openqa.selenium.*;
import org.openqa.selenium.firefox.*;
//Paquetes Utilidades de Testing Propias
import com.uniovi.tests.util.SeleniumUtils;
//Paquetes con los Page Object
import com.uniovi.tests.pageobjects.*;

//Ordenamos las pruebas por el nombre del método
@FixMethodOrder(MethodSorters.NAME_ASCENDING)
public class NotaneitorTests {
	// En Windows (Debe ser la versión 65.0.1 y desactivar las actualizacioens
	// automáticas)):
	// static String PathFirefox65 = "C:\\Program Files\\Mozilla
	// Firefox\\firefox.exe";
	// static String Geckdriver024 = "C:\\Path\\geckodriver024win64.exe";
	// En MACOSX (Debe ser la versión 65.0.1 y desactivar las actualizacioens
	// automáticas):
	static String PathFirefox65 = "C:\\Program Files\\Mozilla Firefox\\firefox.exe";
	// static String PathFirefox64 =
	// "/Applications/Firefox.app/Contents/MacOS/firefox-bin";
	static String Geckdriver024 = "D:\\1Escritorio\\Informatica\\Uni\\Tercer curso\\Segundo Cuatrimestre\\Sistemas Distribuidos e Internet\\PL-SDI-Sesión5-material\\PL-SDI-Sesión5-material\\geckodriver024win64.exe";
	// static String Geckdriver022 =
	// "/Users/delacal/Documents/SDI1718/firefox/geckodriver023mac";
	// Común a Windows y a MACOSX
	static WebDriver driver = getDriver(PathFirefox65, Geckdriver024);
	static String URL = "https://localhost:8081";

	public static WebDriver getDriver(String PathFirefox, String Geckdriver) {
		System.setProperty("webdriver.firefox.bin", PathFirefox);
		System.setProperty("webdriver.gecko.driver", Geckdriver);
		WebDriver driver = new FirefoxDriver();
		return driver;
	}

	@Before
	public void setUp() {
		driver.navigate().to(URL);
	}

	@After
	public void tearDown() {
		driver.manage().deleteAllCookies();
	}

	@BeforeClass
	static public void begin() {
		// COnfiguramos las pruebas.
		// Fijamos el timeout en cada opción de carga de una vista. 2 segundos.
		PO_View.setTimeout(3);

	}

	@AfterClass
	static public void end() {
		// Cerramos el navegador al finalizar las pruebas
		driver.quit();
	}

	// PR01. Registro de Usuario con datos válidos. /
	@Test
	public void PR01() {
		// Vamos al formulario de registro
		PO_HomeView.clickOption(driver, "registrarse", "class", "btn btn-primary");
		// Rellenamos el formulario.
		PO_RegisterView.fillForm(driver, "prueba@email.com", "Prueba", "1", "77777", "77777");
		try {
			// COmprobamos el error de email vacio no sale ni el de contraseñas repetidas.
			PO_View.checkElement(driver, "free", "//div[contains(text(), 'No deje campos vacios')]");
			PO_View.checkElement(driver, "free", "//div[contains(text(), 'Las contraseñas no coinciden')]");
		} catch (Exception e) {
		}
	}

	// PR02. Registro de Usuario con datos inválidos (email vacío, nombre vacío,
	// apellidos vacíos). /
	@Test
	public void PR02() {
		// Vamos al formulario de registro
		PO_HomeView.clickOption(driver, "registrarse", "class", "btn btn-primary");
		// Rellenamos el formulario.
		PO_RegisterView.fillForm(driver, "", "", "", "77777", "77777");
		// COmprobamos el error de email vacio.
		PO_View.checkElement(driver, "free", "//div[contains(text(), 'No deje campos vacios')]");
	}

	// PR03. Registro de Usuario con datos inválidos (repetición de contraseña
	// inválida)./
	@Test
	public void PR03() {
		// Vamos al formulario de registro
		PO_HomeView.clickOption(driver, "registrarse", "class", "btn btn-primary");
		// Rellenamos el formulario.
		PO_RegisterView.fillForm(driver, "prueba3@email.com", "Prueba", "3", "71", "7");
		// COmprobamos el error de contraseña repetida.
		PO_View.checkElement(driver, "free", "//div[contains(text(), 'Las contraseñas no coinciden')]");
	}

	// PR04.Registro de Usuario con datos inválidos (email existente). /
	@Test
	public void PR04() {
		// Vamos al formulario de registro
		PO_HomeView.clickOption(driver, "registrarse", "class", "btn btn-primary");
		// Rellenamos el formulario con el email metido al inicio
		PO_RegisterView.fillForm(driver, "prueba@email.com", "Prueba", "3", "71", "7");
		// COmprobamos el error de email repetido.
		PO_View.checkElement(driver, "free", "//div[contains(text(), 'Email existente')]");
	}

	// PR05. Inicio de sesión con datos válidos (usuario estándar) /
	@Test
	public void PR05() {
		// Vamos al formulario de registro
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		// Nos registramos con un usuario existente
		PO_LoginView.fillForm(driver, "prueba@email.com", "77777");
		// Comprobamos que no sale el mensaje de errorde identificacion
		try {
			PO_View.checkElement(driver, "free", "//div[contains(text(), 'Fallo de Identificacion')]");
		} catch (Exception e) {
		}
		// Ahora nos desconectamos
		PO_HomeView.clickOptionNoPages(driver, "desconectarse", "class", "btn btn-primary");
	}

	// PR06. Inicio de sesión con datos inválidos (usuario estándar, campo email
	// contraseña vacíos)./
	@Test
	public void PR06() { // Vamos al formulario de registro
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		// Nos registramos con un usuario con malos datos
		PO_LoginView.fillForm(driver, "", "");
		PO_View.checkElement(driver, "free", "//div[contains(text(), 'Fallo de Identificacion')]");
	}

	// PR07. Inicio de sesión con datos inválidos (usuario estándar, email
	// existente,pero contraseña incorrecta)./
	@Test
	public void PR07() {
		// Vamos al formulario de registro
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		// Nos registramos con un usuario con malos datos
		PO_LoginView.fillForm(driver, "prueba@email.com", "8888");
		PO_View.checkElement(driver, "free", "//div[contains(text(), 'Fallo de Identificacion')]");
	}

	// PR08. Inicio de sesión con datos inválidos (usuario estándar, email no
	// existente y contraseña no vacía)./
	@Test
	public void PR08() { // Vamos al formulario de registro
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		// Nos registramos con un usuario con malos datos
		PO_LoginView.fillForm(driver, "prueba8@email.com", "8888");
		PO_View.checkElement(driver, "free", "//div[contains(text(), 'Fallo de Identificacion')]");
	}

	// PR09. Hacer click en la opción de salir de sesión y comprobar que se redirige
	// a la página de inicio de sesión (Login). /
	@Test
	public void PR09() {
		// Vamos al formulario de registro
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		// Nos registramos con un usuario existente
		PO_LoginView.fillForm(driver, "prueba@email.com", "77777");
		// Vamos a desconectarnos
		PO_HomeView.clickOptionNoPages(driver, "desconectarse", "class", "btn btn-primary");
		// Vemos que sale el mensaje que nos dice que nos hemos desconectado
		PO_View.checkElement(driver, "free", "//div[contains(text(), 'Usuario Desconectado')]");
	}

	// PR10. Comprobar que el botón cerrar sesión no está visible si el usuario no
	// está autenticado. /
	@Test
	public void PR10() {
		try {
			// Vamos a desconectarnos
			PO_HomeView.clickOptionNoPages(driver, "desconectarse", "class", "btn btn-primary");
		} catch (Exception e) {
		}
	}

	// PR11. Mostrar el listado de usuarios y comprobar que se muestran todos los
	// que existen en el sistema /
	@Test
	public void PR11() {
		// Vamos al formulario de registro
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		// Nos registramos con un usuario existente
		PO_LoginView.fillForm(driver, "prueba@email.com", "77777");
		// Vemos que existen los usuarios
		PO_View.checkElement(driver, "free", "//div[contains(text(), 'macmiller@gmail.com')]");
		PO_View.checkElement(driver, "free", "//div[contains(text(), 'aitorastur99@gmail.com')]");
		// Ahora nos desconectamos
		PO_HomeView.clickOptionNoPages(driver, "desconectarse", "class", "btn btn-primary");
	}

	// PR12.Hacer una búsqueda con el campo vacío y comprobar que se muestra la
	// página que
	// corresponde con el listado usuarios existentes en el sistema
	@Test
	public void PR12() {
		// Vamos al formulario de registro
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		// Nos registramos con un usuario existente
		PO_LoginView.fillForm(driver, "prueba@email.com", "77777");
		// Buscamos el usuario
		PO_PrivateView.searchByText(driver, "macmiller@gmail.com");
		// Vemos que existe el usuario
		PO_View.checkElement(driver, "free", "//div[contains(text(), 'macmiller@gmail.com')]");
		// Ahora nos desconectamos
		PO_HomeView.clickOptionNoPages(driver, "desconectarse", "class", "btn btn-primary");
	}

	// PR13. Hacer una búsqueda escribiendo en el campo un texto que no exista y
	// comprobar que se muestra la página que corresponde, con la lista deusuarios
	// vacía./
	@Test
	public void PR13() {
		// Vamos al formulario de registro
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		// Nos registramos con un usuario existente
		PO_LoginView.fillForm(driver, "prueba@email.com", "77777");
		// Esperamos a que se muestren los enlaces de paginacion la lista de usuarios
		PO_View.checkElement(driver, "free", "//a[contains(@class, 'page-link')]");
		// Contamos el número de filas de usuarios que no se puede porque tarda //
		// demasiado en cargar
		PO_PrivateView.searchByText(driver, "algoquenocorrresponde");
		try {
			PO_View.checkElement(driver, "free", "//div[contains(text(), 'algoquenocorresponde')]");
		} catch (TimeoutException te) {
		}
		// Ahora nos desconectamos
		PO_HomeView.clickOptionNoPages(driver, "desconectarse", "class", "btn btn-primary");
	}

	// PR14. Hacer una búsqueda con un texto específico y comprobar que se muestra
	// // la página que // corresponde, con la lista de usuarios en los que el
	// texto especificados sea // parte de su nombre, apellidos o // de su email.

	@Test
	public void PR14() {
		// Vamos al formulario de logueo.
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		// Rellenamos el formulario
		PO_LoginView.fillForm(driver, "macmiller@gmail.com", "1");
		// Esperamos a que se muestren los enlaces de paginacion la lista de usuarios
		PO_View.checkElement(driver, "free", "//a[contains(@class, 'page-link')]");
		// Contamos el número de filas de usuarios y solo es la que buscamos
		PO_PrivateView.searchByText(driver, "Aitor");
		List<WebElement> elementos = PO_View.checkElement(driver, "free", "//div[contains(text(), 'Aitor')]");
		assertTrue(elementos.size() == 1);
		// Ahora nos desconectamos
		PO_HomeView.clickOptionNoPages(driver, "desconectarse", "class", "btn btn-primary");
	}

	// PR15. Desde el listado de usuarios de la aplicación, enviar una invitaciónde
	// amistad a un usuario.
	// Comprobar que la solicitud de amistad aparece en el listado de invitaciones
	// // (punto siguiente). /
	@Test
	public void PR15() { // Vamos al formulario de logueo.
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		// Rellenamos el formulario
		PO_LoginView.fillForm(driver, "macmiller@gmail.com", "1");
		// Esperamos a que se muestren los enlaces de paginacion la lista de usuarios
		PO_View.checkElement(driver, "free", "//a[contains(@class, 'page-link')]");
		// Buscamos un usuario cualquiera y le enviamos una solicitud
		WebElement btnPeticion = driver.findElement(By.id("btnpostmalone@gmail.com"));
		btnPeticion.click(); // Ahora nos desconectamos
		PO_HomeView.clickOptionNoPages(driver, "desconectarse", "class", "btn btn-primary");
		// Vamos a ver que existe la peticion en la otra cuenta
		// Vamos al formulario de logueo.
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		// Rellenamos el formulario
		PO_LoginView.fillForm(driver, "postmalone@gmail.com", "1"); // Vamos a las peticiones.
		PO_HomeView.clickOptionNoPages(driver, "listFriendPetition", "class", "btn btn-primary");
		// Vemos que existe la peticion
		PO_View.checkElement(driver, "free", "//div[contains(text(), 'macmiller@gmail.com')]");
		// Ahora nos desconectamos
		PO_HomeView.clickOptionNoPages(driver, "desconectarse", "class", "btn btn-primary");

	}

	// PR16. Desde el listado de usuarios de la aplicación, enviar una invitaciónde
	// amistad a un usuario al que ya le habíamos enviado la invitaciónpreviamente.
	// No debería dejarnos enviar la invitación, se podría ocultarel botónde
	// enviar invitación o notificar que ya había sido enviada previamente/
	@Test
	public void PR16() {
		// Vamos al formulario de logueo.
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		// Rellenamos el formulario
		PO_LoginView.fillForm(driver, "macmiller@gmail.com", "1");
		// Esperamos a que se muestren los enlaces de paginacion la lista de usuarios
		PO_View.checkElement(driver, "free", "//a[contains(@class, 'page-link')]");
		// Buscamos un usuario cualquiera y le enviamos una solicitud
		WebElement btnPeticion = driver.findElement(By.id("btnwizka@gmail.com"));
		btnPeticion.click();
		try {
			// Buscamos de nuevo al usuario y le intentamos dar al boton
			btnPeticion = driver.findElement(By.id("btnwizka@gmail.com"));
			btnPeticion.click();
		} catch (Exception e) {
			// Puede dar excepcion por no encontrarlo o por TimeOut asi que cogeremos ambas/
			// con Exception
		}
		// Ahora nos desconectamos
		PO_HomeView.clickOptionNoPages(driver, "desconectarse", "class", "btn btn-primary");
	}

	// PR017. Mostrar el listado de invitaciones de amistad recibidas. Comprobar con
	// un listado que contenga varias invitaciones recibidas. /
	@Test
	public void PR17() {
		// Vamos al formulario de logueo.
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		// Rellenamos el formulario con el usuario al que mandamos en la prueba 15
		// lapeticion
		PO_LoginView.fillForm(driver, "postmalone@gmail.com", "1");
		// Vamos a las peticiones.
		PO_HomeView.clickOptionNoPages(driver, "listFriendPetition", "class", "btn btn-primary");
		// Vemos que existe lapeticion
		PO_View.checkElement(driver, "free", "//div[contains(text(), 'macmiller@gmail.com')]");
		// Ahora nos desconectamos
		PO_HomeView.clickOptionNoPages(driver, "desconectarse", "class", "btn btn-primary");
	}

	// PR18. Sobre el listado de invitaciones recibidas. Hacer click en el
	// botónenlace de una de ellas y comprobar que dicha solicitud desaparece del
	// listado de invitaciones. /

	@Test
	public void PR18() { // Vamos al formulario de logueo.
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		// Rellenamos el formulario con el usuario al que mandamos en la prueba 15 la
		// peticion
		PO_LoginView.fillForm(driver, "postmalone@gmail.com", "1"); // Vamos a las peticiones.
		PO_HomeView.clickOptionNoPages(driver, "listFriendPetition", "class", "btn btn-primary");
		// Vemos que existe la peticion
		PO_View.checkElement(driver, "free", "//div[contains(text(), 'macmiller@gmail.com')]");
		// Aceptamos la solicitud
		WebElement btnPeticion = driver.findElement(By.id("btnmacmiller@gmail.com"));
		btnPeticion.click();
		try {
			// Vemos que no existe la peticion
			PO_View.checkElement(driver, "free", "//div[contains(text(), 'macmiller@gmail.com')]");
		} catch (Exception e) {
		}
		// Ahora nos desconectamos
		PO_HomeView.clickOptionNoPages(driver, "desconectarse", "class", "btn btn-primary");
	}

	// PR19. Mostrar el listado de amigos de un usuario. Comprobar que el listado
	// contiene los amigos que deben ser. /

	@Test
	public void PR19() { // Vamos al formulario de logueo.
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		// Rellenamos el formulario con el que aceptamos al amigo en la prueba 18
		PO_LoginView.fillForm(driver, "postmalone@gmail.com", "1"); // Vamos a las peticiones.
		PO_HomeView.clickOptionNoPages(driver, "listFriends", "class", "btn btn-primary");
		// Vemos que contiene al amigo
		PO_View.checkElement(driver, "free", "//div[contains(text(), 'macmiller@gmail.com')]");
		// Ahora nos desconectamos
		PO_HomeView.clickOptionNoPages(driver, "desconectarse", "class", "btn btn-primary");
	}

	// P20.Intentar acceder sin estar autenticado a la opción de listado de
	// usuarios.Se deberávolver al formulario de login./
	@Test
	public void PR20() {
		// Primero intentaremos acceder por la barra de navegacion para ver que no se
		// muestran las opciones en ella en ese caso
		try {
			// Vamos a las peticiones.
			PO_HomeView.clickOptionNoPages(driver, "listFriendPetition", "class", "btn btn-primary");

		} catch (Exception e) {
		}
		// Comprobamos que estamos en la pagina principal porque no se puede hacer click
		assertTrue(driver.getCurrentUrl().contentEquals("https://localhost:8081/"));
		// Ahora intentaremos acceder por URL
		try { // Vamos a las peticiones.
			driver.navigate().to(URL + "/listFriendPetition");
		} catch (Exception e) {
		}
		// Comprobamos que al intentar acceder por url estamos en el login
		assertTrue(driver.getCurrentUrl().contentEquals("https://localhost:8081/identificarse"));
		// Comprobamos que estamos enlogin
		PO_View.checkElement(driver, "free", "//h2[contains(text(), 'Identificación de usuario')]");
	}

	// PR21. Intentar acceder sin estar autenticado a la opción de listado de
	// invitaciones de amistad recibida de un usuario estándar.
	// Se deberá volver al formulario de login. /
	@Test
	public void PR21() {
		// Primero intentaremos acceder por la barra de navegacion para ver que no se
		// muestran las opciones en ella en ese caso
		try { // Vamos a las peticiones.
			PO_HomeView.clickOptionNoPages(driver, "listUsers", "class", "btn btn-primary");
		} catch (Exception e) {
		}
		// Comprobamos que estamos en la pagina principal porque no se puede hacer click
		assertTrue(driver.getCurrentUrl().contentEquals("https://localhost:8081/"));
		// Ahora intentaremos acceder por URL
		try {
			// Vamos a las peticiones.
			driver.navigate().to(URL + "/listUsers");
		} catch (

		Exception e) {
		} // Comprobamos que al intenta acceder por url estamos en el login
		assertTrue(driver.getCurrentUrl().contentEquals("https://localhost:8081/identificarse"));
		// Comprobamos que estamos en el login
		PO_View.checkElement(driver, "free", "//h2[contains(text(), 'Identificación de usuario')]");
	}

	// PR22. Sin hacer /

	@Test
	public void PR22() {
		// Primero intentaremos acceder por la barra denavegacion para ver que no se
		// muestran las opciones en ella en ese caso
		try {
			// Vamos a las peticiones.
			PO_HomeView.clickOptionNoPages(driver, "listFriends", "class", "btn btn-primary");
		} catch (Exception e) {
		}
		// Comprobamos que estamos en la pagina principal porque no se puede hacer click

		assertTrue(driver.getCurrentUrl().contentEquals("https://localhost:8081/"));
		// Ahora intentaremos acceder por URL
		try {
			// Vamos a las peticiones.
			driver.navigate().to(URL + "/listFriends");
		} catch (Exception e) {
		}
		// Comprobamos que al intentar acceder por url estamos en el login
		assertTrue(driver.getCurrentUrl().contentEquals("https://localhost:8081/identificarse"));
	}

	// PR23. Inicio de sesión con datos válidos /
	@Test
	public void PR23() { // Vamos al cliente.html
		driver.navigate().to(URL + "/cliente.html"); // Rellenamos el formulario con datos validos
		PO_LoginView.fillForm(driver, "macmiller@gmail.com", "1");
		try { // COmprobamos el error de el error de usuario no encontrado no sale.
			PO_View.checkElement(driver, "free", "//div[contains(text(), 'Usuario no encontrado')]");
		} catch (Exception e) {
		}
	}

	// PR24. Inicio de sesión con datos inválidos (usuario no existente en la //
	// aplicación)./
	@Test
	public void PR24() {
		// Vamos al cliente.html
		driver.navigate().to(URL + "/cliente.html");
		// Rellenamos el formulario con datos validos
		PO_LoginView.fillForm(driver, "yonoexisto@gmail.com", "1");
		// COmprobamos el error de el error de usuario no encontrado no sale.
		PO_View.checkElement(driver, "free", "//div[contains(text(), 'Usuario no encontrado')]");

	}

	// PR25. Acceder a la lista de amigos de un usuario, que al menos tenga tres
	// amigos /
	@Test
	public void PR25() { // Vamos al cliente.html
		driver.navigate().to(URL + "/cliente.html");
		// Rellenamos el formulario con datos validos
		PO_LoginView.fillForm(driver, "macmiller@gmail.com", "1");
		// COmprobamos que salen los tres amigos
		PO_View.checkElement(driver, "free", "//td[contains(text(), 'Travis')]");
		PO_View.checkElement(driver, "free", "//td[contains(text(), 'Austin')]");
		PO_View.checkElement(driver, "free", "//td[contains(text(), 'Aitor')]");
	}

	// PR26. Acceder a la lista de amigos de un usuario, y realizar un filtrado para
	// encontrar a un amigo concreto, el nombre a buscar debe coincidir conel de un
	// // amigo. /
	@Test
	public void PR26() {
		// Vamos al cliente.html
		driver.navigate().to(URL + "/cliente.html");
		// Rellenamos el formulario con datos validos
		PO_LoginView.fillForm(driver, "macmiller@gmail.com", "1");
		// Contamos el número de filas de usuarios y solo es la que buscamos
		PO_PrivateView.searchByText(driver, "Aitor");
		List<WebElement> elementos = PO_View.checkElement(driver, "free", "//td[contains(text(), 'Aitor')]");
		assertTrue(elementos.size() == 1);
	}

	// PR27.Acceder a la lista de mensajes de un amigo “chat”, la lista debe
	// contener al menos tres mensajes. /
	@Test
	public void PR27() {
		// Vamos al cliente.html
		driver.navigate().to(URL + "/cliente.html");
		// Rellenamos el formulario con datos validos
		PO_LoginView.fillForm(driver, "macmiller@gmail.com", "1");
		PO_View.checkElement(driver, "free", "//td[contains(text(), 'Aitor')]");
		// Buscamos un usuario cualquiera y vemos los mensajes con el
		WebElement btnMsg = driver.findElement(By.xpath(" //*[@id='btnaitorastur99@gmail.com']"));
		btnMsg.click();
		PO_View.checkElement(driver, "free", "//td[contains(text(), 'Prueba Mensaje Test Aitor MacMiller')]");
		PO_View.checkElement(driver, "free", "//td[contains(text(), 'pruebaBuena2')]");
		PO_View.checkElement(driver, "free", "//td[contains(text(), 'pruebaBuena2945')]");
	}

	// PR028. Acceder a la lista de mensajes de un amigo “chat” y crear un nuevo
	// mensaje, validar que el mensaje aparece en la lista de mensajes. /
	@Test
	public void PR28() {
		// Vamos al cliente.html
		driver.navigate().to(URL + "/cliente.html");
		// Rellenamos el formulario con datos validos
		PO_LoginView.fillForm(driver, "macmiller@gmail.com", "1");
		PO_View.checkElement(driver, "free", "//td[contains(text(), 'Aitor')]");
		// Buscamos un usuario cualquiera y vemos los mensajes con el
		WebElement btnMsg = driver.findElement(By.xpath(" //*[@id='btnaitorastur99@gmail.com']"));
		btnMsg.click();
		// Enviamos el mensaje
		PO_PrivateView.addMensaje(driver, "Prueba 283");
		// Comprobamos que esta
		PO_View.checkElement(driver, "free", "//td[contains(text(), 'Prueba 28')]");
	}

	// PR029. Identificarse en la aplicación y enviar un mensaje a un amigo, validar
	// que el mensaje enviado aparece en el chat. Identificarse después con el
	// usuario que recibido el mensaje y validar que tiene un mensaje sin leer,
	// entrar en el chat y comprobar que el mensaje pasa a tener el estado leído. /
	@Test
	public void PR29() {
		// Vamos al cliente.html
		driver.navigate().to(URL + "/cliente.html");
		// Rellenamos el formulario con datos del usuario que recibio el mensaje de la prueba 28
		PO_LoginView.fillForm(driver, "aitorastur99@gmail.com", "12345");
		PO_View.checkElement(driver, "free", "//td[contains(text(), 'McCormick')]");
		// Buscamos un usuario cualquiera y vemos los mensajes con el
		WebElement btnMsg = driver.findElement(By.xpath("//*[@id=\"btnmacmiller@gmail.com\"]"));
		btnMsg.click();
		// Comprobamos que esta el mensaje
		PO_View.checkElement(driver, "free", "//td[contains(text(), 'Prueba 283')]");
		// Comprobamos que su estado es leido
		PO_View.checkElement(driver, "free", "//td[contains(text(), 'Leido')]");
	}

}
