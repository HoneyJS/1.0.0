/**
 * Role 角色（玩家Character）
 * @author Rhine
 * @version 2013-11-09
 * 若做网游则Role模块需要增强功能
 */
(function(){

function Role() {
	Honey.Character.apply(this, arguments);
	
	this.tag = "Role";
};
Honey.inherit(Role, Honey.Character);
Honey.Role = Role;

var RoleM = {
	roles : {},
	get : function(name){
		if (!this.roles[name]) this.roles[name] = new Role(name);
		return this.roles[name];
	},
};
window.RoleM = RoleM;

})();
