package com.uniovi.tests.pageobjects;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.Select;

import com.uniovi.tests.util.SeleniumUtils;


public class PO_PrivateView extends PO_NavView{
	static public void fillFormAddMark(WebDriver driver, int userOrder, String descriptionp, String scorep)
	{	
		//Espero por que se cargue el formulario de asñadir nota (Concretamente el botón class="btn")
		PO_View.checkElement(driver, "class", "btn");
		//Seleccionamos el alumnos userOrder
	    new Select (driver.findElement(By.id("user"))).selectByIndex(userOrder);
	    //Rellenemos el campo de descripción
	    WebElement description = driver.findElement(By.name("description"));
		description.clear();
		description.sendKeys(descriptionp);
		WebElement score = driver.findElement(By.name("score"));
		score.click();
		score.clear();
		score.sendKeys(scorep);
		By boton = By.className("btn");
		driver.findElement(boton).click();	
	}
	static public void searchByText(WebDriver driver,String searchTextp) {
		// Esperamos 5 segundo a que carge el DOM porque en algunos equipos falla
		SeleniumUtils.esperarSegundos(driver, 5);
		// Rellenemos el campo de descripción
		WebElement searchText = driver.findElement(By.name("busqueda"));
		searchText.clear();
		searchText.sendKeys(searchTextp);
		By boton = By.className("btn");
		driver.findElement(boton).click();
	}
	
	static public void addMensaje(WebDriver driver,String textp) {
		// Esperamos 5 segundo a que carge el DOM porque en algunos equipos falla
		SeleniumUtils.esperarSegundos(driver, 5);
		// Rellenemos el campo de descripción
		WebElement text = driver.findElement(By.name("texto"));
		text.clear();
		text.sendKeys(textp);
		By boton = By.xpath("//*[@id='boton-enviarMensaje']");
		driver.findElement(boton).click();
	}

}