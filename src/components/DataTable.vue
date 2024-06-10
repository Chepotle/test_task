<template>
	<div class="wrapper">
		<input
			@input="setSearch"
			v-model="searchValue"
			placeholder="search"
			class="search"
			type="text"
		/>
		<div v-if="loading" class="">Loading...</div>
		<table v-else class="table">
			<thead>
				<tr>
					<th @click="sortTable(header)" v-for="header in headers" :key="header.name">{{ header.name }}</th>
				</tr>
			</thead>
			<tbody>
					<tr class="table__row" v-for="item  in pageData" :key="item.login.uuid">
						<td class="table__item"><img :src="item.picture.medium" alt="avatar" /></td>
						<td class="table__item">{{ item.name.first }} {{ item.name.last }}</td>
						<td class="table__item">{{ item.gender }}</td>
						<td class="table__item">{{ item.location.country }}</td>
						<td class="table__item">{{ formatDate(item.dob.date) }}</td>
						<td class="table__item">{{ item.email }}</td>
						<td class="table__item">{{ item.phone }}</td>
					</tr>
			</tbody>
		</table>
		
		<div class="pagination">
			<div class="pagination__page"
				@click="setPage(page)"
				:class="{'pagination__current': page === pageNumber}"
				v-for="page in totalPages"
				:key="page"
			>
				{{ page }}
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { getData, Response, ResponseResults } from '@/data/tableData';
import { defineComponent } from 'vue';


export default defineComponent({
  name: 'DataTable',
  components: {
    
  },
	data() {
		return {
			tableData: {} as Response,
			searchValue: this.$route.query.search ? String(this.$route.query.search) : '',
			pageNumber: this.$route.query.page ? parseInt(String(this.$route.query.page)) : 1,
			sortedData: [] as ResponseResults[],
			limit: 20,
			loading: true,
			headers: [
				{name: 'Avatar', path: 'picture.medium', sortValue: ''},
				{name: 'Full Name', path: 'name.first', sortValue: ''},
				{name: 'Gender', path: 'gender', sortValue: ''},
				{name: 'Country', path: 'location.country', sortValue: ''},
				{name: 'Birthday', path: 'dob.date', sortValue: ''},
				{name: 'Email', path: 'email', sortValue: ''},
				{name: 'Phone', path: 'phone', sortValue: ''},
			],
		}
	},
	methods: {
		async fetchData() {
      try {
				this.loading = true;
        this.tableData = await getData<Response>('/api.json');
				this.loading = false;
				const headerItem = this.headers.find((item) => item.name === this.$route.query.sortName);
				if (headerItem) this.sortTable(headerItem);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    },
		getObjData(obj: any, path: string) {
      const split = path.split('.');
      return split.reduce((acc, el) => acc?.[el], obj);
    },
		sortTable(item: {name: string, path: string, sortValue: string}): ResponseResults[] | undefined {
			this.sortedData = this.filteredData || [];
			if (!item.sortValue) {
				item.sortValue = 'ASC';
				const newQuery = {
				...this.$route.query,
				sortName: item.name,
				sortValue: item.sortValue
				}
				this.$router.push({ query: newQuery });
					return this.sortedData.sort((a, b) => {
						return this.sortedData = this.getObjData(a, item.path).toLowerCase().localeCompare(this.getObjData(b, item.path).toLowerCase())
					});
      } else if (item.sortValue === 'ASC') {
        item.sortValue = 'DESC';
				const newQuery = {
				...this.$route.query,
				sortName: item.name,
				sortValue: item.sortValue
				}
				this.$router.push({ query: newQuery });
					return this.sortedData.sort((a, b) => {
						return this.sortedData = this.getObjData(b, item.path).toLowerCase().localeCompare(this.getObjData(a, item.path).toLowerCase())
					});
      } else if (item.sortValue === 'DESC') {
				item.sortValue = '';
				const newQuery = {
				...this.$route.query,
				sortName: item.name,
				sortValue: item.sortValue
				}
				this.$router.push({ query: newQuery });
					return this.sortedData.sort((a, b) => {
						return this.sortedData = this.getObjData(b, item.path).toLowerCase().localeCompare(this.getObjData(a, item.path).toLowerCase())
					});
			}
			
			return this.sortedData;
		},
		formatDate(date: string): string {
			const dateObj = new Date(date);
			const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      const year = dateObj.getFullYear();
			return `${day}.${month}.${year}`;
		},
		setPage(page: number) {
			this.pageNumber = page;
			const newQuery = {
        ...this.$route.query,
        page: page.toString()
      };
      this.$router.push({ query: newQuery });
		},
		setSearch() {
			const newQuery = {
				...this.$route.query,
				search: this.searchValue
			}
			this.$router.push({ query: newQuery });
		},
		matchesSearch(item: ResponseResults, searchValue: string) {
      const search = searchValue.toLowerCase();
      const checkValue = (value: any): boolean => {
        if (typeof value === 'object' && value !== null) {
          return Object.values(value).some(v => checkValue(v));
        }
        return String(value).toLowerCase().includes(search);
      };
      return checkValue(item);
    },
	},
	computed: {
		totalPages(): number {
			if (!this.loading) {
				return Math.ceil((this.filteredData || []).length / this.limit);
			}
			return 0
		},
		pageData(): ResponseResults[] | undefined {
			if (this.pageNumber > this.totalPages) {
				this.setPage(1);
			}
			if (!this.loading) {
				const start = (this.pageNumber - 1) * this.limit;
				const end = start + this.limit;
				return (this.filteredData || []).slice(start, end);
			}
			return this.filteredData;
		},
		filteredData(): ResponseResults[] | undefined {
			if (!this.searchValue) {
        return this.tableData.results;
      }
      return this.tableData.results.filter(item => this.matchesSearch(item, this.searchValue));
		}
	},
	mounted() {
		this.fetchData();
	}
});
</script>

<style lang="scss" scoped>
.wrapper {
	margin: 15px;
}

.search {
	border: 1px solid black;
	padding: 10px 15px;
	width: 100%;
	margin: 10px 0 50px 0;
}

.table {
	border: 2px solid black;
	border-collapse: collapse;
	th: {
		cursor: pointer;
	}

	td, th {
		border: 3px solid black;
	}

	td, th {
		padding: 10px 20px;
		text-align: center;
		border-collapse: collapse;
		border: 3px solid black;
	}
}

.pagination {
	display: flex;
	margin-top: 25px;
	&__page {
		border: 1px solid black;
		padding: 10px;
		cursor: pointer;
	}

	&__current {
		border: 2px solid green;
	}
}



</style>