export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignee_id?: string;
  tag_ids?: string[];
  predecessor_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Collaborator {
  id: string;
  user_id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
}

export interface CustomInstruction {
  id: string;
  title: string;
  content: string;
}
