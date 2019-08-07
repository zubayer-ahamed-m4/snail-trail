/**
 * 
 */
package com.coderslab.controller;

import java.util.Arrays;
import java.util.List;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.coderslab.model.Data;
import com.coderslab.model.User;

/**
 * @author zubay
 *
 */
@Controller
@RequestMapping("/table")
public class TableRowDrugDrop {

	@GetMapping
	public String loadTablepage() {
		return "table/table";
	}

	@RequestMapping("/student")
	public @ResponseBody Data getAllStudents(){
		Data data = new Data();
		data.setData(Arrays.asList(
				new User(new Long(1), "zubayer", 10),
				new User(new Long(2), "sajid", 20),
				new User(new Long(3), "jarin", 30),
				new User(new Long(4), "mishu", 40),
				new User(new Long(5), "jayed", 50)
			)
		);
		return data;
	}
	
	
}
