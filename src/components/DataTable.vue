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
					<th @click="sortTable(header.name, header.path)" v-for="header in headers" :key="header.name">{{ header.name }}</th>
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
			currentSortValue: this.$route.query.sortValue ? String(this.$route.query.sortValue): '',
			currentSortName: this.$route.query.sortName ? String(this.$route.query.sortName): '',
			currentSortItemPath: this.$route.query.sortPath ? String(this.$route.query.sortPath): '',
			limit: 20,
			loading: true,
			headers: [
				{name: 'Avatar', path: 'picture.medium'},
				{name: 'Full Name', path: 'name.first'},
				{name: 'Gender', path: 'gender'},
				{name: 'Country', path: 'location.country'},
				{name: 'Birthday', path: 'dob.date'},
				{name: 'Email', path: 'email'},
				{name: 'Phone', path: 'phone'},
			],
		}
	},
	methods: {
		async fetchData() {
      try {
				this.loading = true;
        getData<Response>('/api.json').then((data) => {
					this.tableData = data;
				}).then(() => this.loading = false)
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    },
		getObjData(obj: any, path: string) {
      const split = path.split('.');
      return split.reduce((acc, el) => acc?.[el], obj);
    },
		sortTable(sortName: string, sortItemPath: string) {
			if (!this.currentSortValue) {
				this.currentSortValue = 'ASC';
				
      } else if (this.currentSortValue === 'ASC') {
        this.currentSortValue = 'DESC';

      } else if (this.currentSortValue === 'DESC') {
				this.currentSortValue = '';
			}
			this.currentSortItemPath = sortItemPath
			this.currentSortName = sortName;
			const newQuery = {
				...this.$route.query,
				sortName: this.currentSortName,
				sortValue: this.currentSortValue,
				sortPath: this.currentSortItemPath,
			}
			this.$router.push({ query: newQuery });
			
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
		filteredData(): ResponseResults[] {
			if (!this.searchValue) {
        return this.sortedData;
      }
      return this.sortedData.filter(item => this.matchesSearch(item, this.searchValue));
		},
		sortedData(): ResponseResults[] {
			if (this.currentSortItemPath) {
				if (this.currentSortValue === 'ASC') {
				return [...this.tableData.results].sort((a, b) => {
					return this.getObjData(a, this.currentSortItemPath).toLowerCase().localeCompare(this.getObjData(b, this.currentSortItemPath).toLowerCase())
				});
			}
			
			if (this.currentSortValue === 'DESC')
				return [...this.tableData.results].sort((a, b) => {
					return this.getObjData(b, this.currentSortItemPath).toLowerCase().localeCompare(this.getObjData(a, this.currentSortItemPath).toLowerCase())
				});
			}
			
			return [...this.tableData.results];
		},
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
	th {
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