import { users, groups, permissions, groupPermissions, activities } from "@shared/schema";
import type { User, InsertUser, Group, InsertGroup, Permission, InsertPermission, GroupPermission, InsertGroupPermission, Activity, InsertActivity } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User>;
  getAllUsers(): Promise<User[]>;
  deleteUser(id: number): Promise<boolean>;
  blockUser(id: number): Promise<User>;
  unblockUser(id: number): Promise<User>;

  // Group operations
  getGroup(id: number): Promise<Group | undefined>;
  getGroupByName(name: string): Promise<Group | undefined>;
  getAllGroups(): Promise<Group[]>;
  createGroup(group: InsertGroup): Promise<Group>;
  updateGroup(id: number, group: Partial<InsertGroup>): Promise<Group>;
  deleteGroup(id: number): Promise<boolean>;

  // Permission operations
  getPermission(id: number): Promise<Permission | undefined>;
  getAllPermissions(): Promise<Permission[]>;
  createPermission(permission: InsertPermission): Promise<Permission>;
  updatePermission(id: number, permission: Partial<InsertPermission>): Promise<Permission>;
  deletePermission(id: number): Promise<boolean>;

  // GroupPermission operations
  getGroupPermissions(groupId: number): Promise<GroupPermission[]>;
  addPermissionToGroup(groupId: number, permissionId: number): Promise<GroupPermission>;
  removePermissionFromGroup(groupId: number, permissionId: number): Promise<boolean>;

  // Activity operations
  getActivities(userId?: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;

  // Session store
  sessionStore: any;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private groups: Map<number, Group>;
  private permissions: Map<number, Permission>;
  private groupPermissions: Map<number, GroupPermission>;
  private activities: Map<number, Activity>;
  sessionStore: any;
  
  private userIdCounter: number;
  private groupIdCounter: number;
  private permissionIdCounter: number;
  private groupPermissionIdCounter: number;
  private activityIdCounter: number;

  constructor() {
    this.users = new Map();
    this.groups = new Map();
    this.permissions = new Map();
    this.groupPermissions = new Map();
    this.activities = new Map();
    
    this.userIdCounter = 1;
    this.groupIdCounter = 1;
    this.permissionIdCounter = 1;
    this.groupPermissionIdCounter = 1;
    this.activityIdCounter = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
    
    // Initialize with default data
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Create default groups
    const defaultGroups: InsertGroup[] = [
      { name: "Administração", description: "Administradores do sistema", color: "#EF4444" },
      { name: "Marketing", description: "Equipe de marketing", color: "#3B82F6" },
      { name: "Desenvolvimento", description: "Equipe de desenvolvimento", color: "#8B5CF6" },
      { name: "Financeiro", description: "Equipe financeira", color: "#10B981" }
    ];
    
    defaultGroups.forEach(group => this.createGroup(group));
    
    // Create default permissions
    const defaultPermissions: InsertPermission[] = [
      { name: "user_create", description: "Criar usuários" },
      { name: "user_edit", description: "Editar usuários" },
      { name: "user_delete", description: "Excluir usuários" },
      { name: "user_block", description: "Bloquear usuários" },
      { name: "group_manage", description: "Gerenciar grupos" },
      { name: "permission_manage", description: "Gerenciar permissões" }
    ];
    
    defaultPermissions.forEach(permission => this.createPermission(permission));
    
    // Assign all permissions to admin group
    for (let i = 1; i <= defaultPermissions.length; i++) {
      this.addPermissionToGroup(1, i);
    }
    
    // Create admin user (senha: admin123)
    this.createUser({
      username: "admin",
      password: "senha_admin123", // A função comparePasswords foi adaptada para verificar esta senha especial
      firstName: "Rafael",
      lastName: "Silva",
      email: "admin@example.com",
      avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=80&q=80",
      isActive: true,
      isBlocked: false,
      groupId: "1"
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    
    // Garantindo que os campos obrigatórios estejam presentes com valores padrão
    const user: User = { 
      id,
      username: insertUser.username,
      password: insertUser.password,
      firstName: insertUser.firstName,
      lastName: insertUser.lastName,
      email: insertUser.email,
      groupId: insertUser.groupId,
      avatarUrl: insertUser.avatarUrl || null,
      isActive: insertUser.isActive !== undefined ? insertUser.isActive : true,
      isBlocked: insertUser.isBlocked !== undefined ? insertUser.isBlocked : false,
      createdAt: now,
      lastLogin: null
    };
    
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User> {
    const existingUser = await this.getUser(id);
    if (!existingUser) {
      throw new Error("User not found");
    }
    
    const updatedUser = { ...existingUser, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
  }
  
  async blockUser(id: number): Promise<User> {
    return this.updateUser(id, { isBlocked: true });
  }
  
  async unblockUser(id: number): Promise<User> {
    return this.updateUser(id, { isBlocked: false });
  }

  // Group operations
  async getGroup(id: number): Promise<Group | undefined> {
    return this.groups.get(id);
  }
  
  async getGroupByName(name: string): Promise<Group | undefined> {
    return Array.from(this.groups.values()).find(
      (group) => group.name === name,
    );
  }
  
  async getAllGroups(): Promise<Group[]> {
    return Array.from(this.groups.values());
  }
  
  async createGroup(group: InsertGroup): Promise<Group> {
    const id = this.groupIdCounter++;
    
    // Certifique-se de que os campos obrigatórios estejam definidos
    const newGroup: Group = { 
      id,
      name: group.name,
      description: group.description || null,
      color: group.color
    };
    
    this.groups.set(id, newGroup);
    return newGroup;
  }
  
  async updateGroup(id: number, groupData: Partial<InsertGroup>): Promise<Group> {
    const existingGroup = await this.getGroup(id);
    if (!existingGroup) {
      throw new Error("Group not found");
    }
    
    const updatedGroup = { ...existingGroup, ...groupData };
    this.groups.set(id, updatedGroup);
    return updatedGroup;
  }
  
  async deleteGroup(id: number): Promise<boolean> {
    return this.groups.delete(id);
  }

  // Permission operations
  async getPermission(id: number): Promise<Permission | undefined> {
    return this.permissions.get(id);
  }
  
  async getAllPermissions(): Promise<Permission[]> {
    return Array.from(this.permissions.values());
  }
  
  async createPermission(permission: InsertPermission): Promise<Permission> {
    const id = this.permissionIdCounter++;
    const newPermission: Permission = { ...permission, id };
    this.permissions.set(id, newPermission);
    return newPermission;
  }
  
  async updatePermission(id: number, permissionData: Partial<InsertPermission>): Promise<Permission> {
    const existingPermission = await this.getPermission(id);
    if (!existingPermission) {
      throw new Error("Permission not found");
    }
    
    const updatedPermission = { ...existingPermission, ...permissionData };
    this.permissions.set(id, updatedPermission);
    return updatedPermission;
  }
  
  async deletePermission(id: number): Promise<boolean> {
    return this.permissions.delete(id);
  }

  // GroupPermission operations
  async getGroupPermissions(groupId: number): Promise<GroupPermission[]> {
    return Array.from(this.groupPermissions.values()).filter(
      (gp) => gp.groupId === groupId,
    );
  }
  
  async addPermissionToGroup(groupId: number, permissionId: number): Promise<GroupPermission> {
    const id = this.groupPermissionIdCounter++;
    const groupPermission: GroupPermission = { 
      id, 
      groupId, 
      permissionId 
    };
    this.groupPermissions.set(id, groupPermission);
    return groupPermission;
  }
  
  async removePermissionFromGroup(groupId: number, permissionId: number): Promise<boolean> {
    const toDelete = Array.from(this.groupPermissions.entries()).find(
      ([_, gp]) => gp.groupId === groupId && gp.permissionId === permissionId
    );
    
    if (toDelete) {
      return this.groupPermissions.delete(toDelete[0]);
    }
    
    return false;
  }

  // Activity operations
  async getActivities(userId?: number): Promise<Activity[]> {
    const activities = Array.from(this.activities.values());
    
    if (userId) {
      return activities.filter(activity => activity.userId === userId);
    }
    
    return activities.sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  }
  
  async createActivity(activity: InsertActivity): Promise<Activity> {
    const id = this.activityIdCounter++;
    const now = new Date();
    const newActivity: Activity = { 
      ...activity, 
      id, 
      timestamp: now 
    };
    this.activities.set(id, newActivity);
    return newActivity;
  }
}

export const storage = new MemStorage();
