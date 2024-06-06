import { Category } from './category';
import { PopulatedComponent } from './components';
import { SavedWorkflow } from './workflow';

/**
 * Response of all categories
 */
export type CategoriesResponse = Category[];

/**
 * Response of a single category
 */
export interface CategoryResponse extends Category {
  components: PopulatedComponent[];
}

/**
 * Single component response
 */
export type ComponentResponse = PopulatedComponent;

/**
 * Response for batch component requests
 */
export type ComponentsResponse = PopulatedComponent[];

/**
 * Response for a shared workflow
 */
export type SharedWorkflowResponse = SavedWorkflow;
